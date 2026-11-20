using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Infrastructure.Data.Core;
using Mpx.Jarbass.Workers.Base;

namespace Mpx.Jarbass.Workers;

public sealed class JarbassWorkflowWorker(
    ILogger<JarbassWorkflowWorker> logger,
    IServiceProvider serviceProvider,
    IConfiguration configuration)
    : MpxJarbassWorker(logger, serviceProvider, configuration, "Workflow", defaultIntervalSeconds: 15)
{
  protected override async Task ExecuteCycleAsync(IServiceProvider scopedProvider, CancellationToken stoppingToken)
  {
    var dbContext = scopedProvider.GetRequiredService<MpxDbContext>();
    var nowUtc = DateTime.UtcNow;

    var activeWatchers = await dbContext.JarbassWorkflowWatchers
        .Include(w => w.ParentWorkflow)
        .Where(w => !w.Inactive &&
                    (w.WatcherStatus == "Watching" || w.WatcherStatus == "TimedOut") &&
                    w.NextPollAtUtc <= nowUtc)
        .ToListAsync(stoppingToken);

    foreach (var watcher in activeWatchers)
    {
      watcher.LastPolledAtUtc = nowUtc;
      watcher.NextPollAtUtc = nowUtc.AddSeconds(Math.Max(5, watcher.PollIntervalSeconds));

      var childQuery = dbContext.Workflows
          .Where(c => !c.Inactive && c.ParentWorkflowId == watcher.ParentWorkflowId);

      if (watcher.SplitGroupId.HasValue)
      {
        childQuery = childQuery.Where(c => c.SplitGroupId == watcher.SplitGroupId);
      }

      var childWorkflows = await childQuery.ToListAsync(stoppingToken);
      var completedBranches = childWorkflows
          .Where(c => string.Equals(c.Status, "Completed", StringComparison.OrdinalIgnoreCase))
          .ToList();
      var completedCount = completedBranches.Count;
      var failedCount = childWorkflows.Count(c => string.Equals(c.Status, "Rejected", StringComparison.OrdinalIgnoreCase) ||
                                                  string.Equals(c.Status, "Failed", StringComparison.OrdinalIgnoreCase));

      watcher.CompletedBranchesCount = completedCount;
      watcher.FailedBranchesCount = failedCount;

      var joinSatisfied = watcher.MergeMode switch
      {
        "WaitFirst" => completedCount >= 1,
        _ => completedCount >= watcher.ExpectedBranchesCount && watcher.ExpectedBranchesCount > 0
      };

      if (joinSatisfied)
      {
        // Horário real auditado em que o último ramo necessário foi concluído (mesmo que tenha ocorrido offline!)
        var effectiveTrustedJoinUtc = completedBranches.Count > 0
            ? completedBranches.Max(c => c.ExecutedAt)
            : nowUtc;

        var wasTimedOut = string.Equals(watcher.WatcherStatus, "TimedOut", StringComparison.OrdinalIgnoreCase);
        var finishedOnTimeOffline = watcher.TimeoutAtUtc.HasValue && effectiveTrustedJoinUtc <= watcher.TimeoutAtUtc.Value;

        watcher.WatcherStatus = "JoinedAndReleased";
        watcher.JoinedAtUtc = nowUtc;
        watcher.EffectiveTrustedJoinedAtUtc = effectiveTrustedJoinUtc;
        watcher.CompletedOfflineOnTime = wasTimedOut && finishedOnTimeOffline;
        watcher.BlockingBranchSummary = null;

        if (watcher.ParentWorkflow is not null)
        {
          watcher.ParentWorkflow.CompletedSplitBranches = completedCount;
          watcher.ParentWorkflow.WaitingForSplitJoin = false;
          watcher.ParentWorkflow.ToWorkflowTypeConfigId = watcher.JoinWorkflowTypeConfigId;
          watcher.ParentWorkflow.Status = "Running";
        }

        var heldItems = await dbContext.WorkflowItems
            .Where(i => i.WorkflowId == watcher.ParentWorkflowId && i.PendingActivation)
            .ToListAsync(stoppingToken);

        foreach (var item in heldItems)
        {
          item.PendingActivation = false;
          item.Inactive = false;
        }

        Logger.LogInformation("[Jarbass:Workflow] Split/Join concluído para o Workflow '{Protocol}' ({Completed}/{Expected} ramos). Etapa de destino liberada!",
            watcher.ParentWorkflow?.Protocol ?? watcher.ParentWorkflowId.ToString(),
            completedCount,
            watcher.ExpectedBranchesCount);
        continue;
      }

      if (watcher.TimeoutAtUtc.HasValue && nowUtc >= watcher.TimeoutAtUtc.Value)
      {
        var pendingProtocols = childWorkflows
            .Where(c => !string.Equals(c.Status, "Completed", StringComparison.OrdinalIgnoreCase))
            .Select(c => c.Protocol)
            .ToList();

        watcher.WatcherStatus = "TimedOut";
        watcher.BlockingBranchSummary = $"Ramos pendentes segurando o Join: {string.Join(", ", pendingProtocols)}";

        dbContext.JarbassInsights.Add(new JarbassInsight
        {
          Id = Guid.NewGuid(),
          CorporationId = watcher.CorporationId,
          JarbassAgentId = watcher.JarbassAgentId,
          TargetEntityId = watcher.ParentWorkflowId,
          Category = "WorkflowSplitJoin",
          Severity = "Warning",
          Code = "WORKFLOW_SPLIT_JOIN_TIMEOUT",
          Title = $"Fluxo '{watcher.ParentWorkflow?.Protocol}' aguardando junção de Split além do tempo limite",
          Details = $"Concluídos {completedCount} de {watcher.ExpectedBranchesCount} ramos. {watcher.BlockingBranchSummary}",
          AutoHealed = false,
          OccurredAtUtc = nowUtc,
          System = true
        });

        Logger.LogWarning("[Jarbass:Workflow] Timeout no Split/Join do Workflow '{Protocol}'. {Blocking}",
            watcher.ParentWorkflow?.Protocol,
            watcher.BlockingBranchSummary);
      }
    }

    if (activeWatchers.Count > 0)
    {
      await dbContext.SaveChangesAsync(stoppingToken);
    }
  }
}
