using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Infrastructure.Data.Core;
using Mpx.Jarbass.Security;

namespace Mpx.Jarbass.Workers.Base;

public abstract class MpxJarbassWorker(
    ILogger logger,
    IServiceProvider serviceProvider,
    IConfiguration configuration,
    string workerKey,
    int defaultIntervalSeconds) : BackgroundService
{
  protected ILogger Logger => logger;
  protected IServiceProvider ServiceProvider => serviceProvider;
  protected IConfiguration Configuration => configuration;
  protected string WorkerKey => workerKey;

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    var enabled = configuration.GetValue($"Jarbass:Workers:{workerKey}:Enabled", true);
    var intervalSeconds = configuration.GetValue($"Jarbass:Workers:{workerKey}:IntervalSeconds", defaultIntervalSeconds);

    if (!enabled)
    {
      logger.LogInformation("[Jarbass:{WorkerKey}] Worker desativado via configuração (Enabled = false).", workerKey);
      return;
    }

    logger.LogInformation(">>> [Jarbass:{WorkerKey}] Iniciado (Intervalo: {IntervalSeconds}s) <<<", workerKey, intervalSeconds);

    await RunSafeCycleAsync(intervalSeconds, stoppingToken);

    using var timer = new PeriodicTimer(TimeSpan.FromSeconds(Math.Max(1, intervalSeconds)));
    while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
    {
      await RunSafeCycleAsync(intervalSeconds, stoppingToken);
    }

    logger.LogInformation(">>> [Jarbass:{WorkerKey}] Finalizado com segurança <<<", workerKey);
  }

  private async Task RunSafeCycleAsync(int intervalSeconds, CancellationToken stoppingToken)
  {
    var sw = Stopwatch.StartNew();
    try
    {
      using var scope = serviceProvider.CreateScope();
      await ExecuteCycleAsync(scope.ServiceProvider, stoppingToken);
      sw.Stop();
      await RecordJobPulseAsync(scope.ServiceProvider, intervalSeconds, sw.ElapsedMilliseconds, null, stoppingToken);
    }
    catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
    {
      // Shutdown normal
    }
    catch (Exception ex)
    {
      sw.Stop();
      logger.LogError(ex, "[Jarbass:{WorkerKey}] Erro durante execução do ciclo.", workerKey);
      try
      {
        using var errScope = serviceProvider.CreateScope();
        await RecordJobPulseAsync(errScope.ServiceProvider, intervalSeconds, sw.ElapsedMilliseconds, ex.Message, stoppingToken);
      }
      catch
      {
        // Silencia caso o banco esteja offline durante o log de falha
      }
    }
  }

  private async Task RecordJobPulseAsync(
      IServiceProvider scopedProvider,
      int intervalSeconds,
      long durationMs,
      string? errorMessage,
      CancellationToken stoppingToken)
  {
    var dbContext = scopedProvider.GetRequiredService<MpxDbContext>();
    var timeGuard = scopedProvider.GetRequiredService<JarbassTimeGuard>();

    var machineName = Environment.MachineName;
    var stamp = timeGuard.StampEvent($"HEARTBEAT|{machineName}|{workerKey}");

    var agent = await dbContext.JarbassAgents
        .FirstOrDefaultAsync(a => a.CorporationId == null && a.MachineName == machineName, stoppingToken);

    if (agent is null)
    {
      agent = new JarbassAgent
      {
        Id = Guid.NewGuid(),
        CorporationId = null,
        Name = $"Morphus Jarbass ({machineName})",
        MachineName = machineName,
        OperatingSystem = Environment.OSVersion.VersionString,
        Version = "1.0.0",
        EnvironmentMode = "Server",
        Status = "Online",
        IsOfflineCapable = true,
        System = true,
        Inactive = false,
        Description = $"Agente oficial Morphus Jarbass em execução na máquina {machineName}."
      };
      dbContext.JarbassAgents.Add(agent);
    }

    agent.Status = "Online";
    agent.LastHeartbeatUtc = stamp.TrustedOccurredAtUtc;
    agent.LastTrustedServerUtc = stamp.TrustedOccurredAtUtc;
    agent.LastCpuTickAnchor = stamp.CpuTickAtEvent;
    agent.HighWaterMarkUtc = stamp.TrustedOccurredAtUtc;
    agent.LastChainHash = stamp.CurrentHash;

    var job = await dbContext.JarbassJobs
        .FirstOrDefaultAsync(j => j.JarbassAgentId == agent.Id && j.Code == workerKey, stoppingToken);

    if (job is null)
    {
      job = new JarbassJob
      {
        Id = Guid.NewGuid(),
        CorporationId = null,
        JarbassAgentId = agent.Id,
        Code = workerKey,
        Name = $"Jarbass {workerKey} Worker",
        Category = workerKey,
        IntervalSeconds = intervalSeconds,
        Enabled = true,
        System = true,
        Inactive = false,
        Description = $"Processo autônomo de vigilância ({workerKey}) do Morphus Jarbass."
      };
      dbContext.JarbassJobs.Add(job);
    }

    job.IntervalSeconds = intervalSeconds;
    job.LastRunUtc = stamp.TrustedOccurredAtUtc;
    job.NextRunUtc = stamp.TrustedOccurredAtUtc.AddSeconds(intervalSeconds);
    job.LastDurationMs = durationMs;
    job.TotalRuns += 1;

    if (string.IsNullOrWhiteSpace(errorMessage))
    {
      job.LastRunStatus = "Success";
      job.LastErrorMessage = null;
    }
    else
    {
      job.LastRunStatus = "Failed";
      job.TotalFailures += 1;
      job.LastErrorMessage = errorMessage.Length > 1000 ? errorMessage[..1000] : errorMessage;
    }

    if (stamp.ClockTampered)
    {
      dbContext.JarbassInsights.Add(new JarbassInsight
      {
        Id = Guid.NewGuid(),
        CorporationId = null,
        JarbassAgentId = agent.Id,
        Category = "Security",
        Severity = "Critical",
        Code = "CLOCK_TAMPERING_DETECTED",
        Title = $"Desvio/adulteração de relógio detectado em {machineName}",
        Details = $"Relógio local reportou {stamp.ReportedDeviceUtc:O}, mas o contador monotônico de CPU aponta {stamp.TrustedOccurredAtUtc:O} (desvio de {stamp.ClockSkewSeconds}s).",
        AutoHealed = true,
        AutoHealAction = "Substituído automaticamente pelo horário verdadeiro auditado (TrustedOccurredAtUtc).",
        OccurredAtUtc = stamp.TrustedOccurredAtUtc,
        System = true
      });
    }

    await dbContext.SaveChangesAsync(stoppingToken);
  }

  protected abstract Task ExecuteCycleAsync(IServiceProvider scopedProvider, CancellationToken stoppingToken);
}
