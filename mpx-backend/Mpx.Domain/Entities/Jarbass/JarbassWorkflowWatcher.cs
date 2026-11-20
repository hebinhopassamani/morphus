using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JarbassWorkflowWatcher : MpxEntity
{
  public Guid CorporationId { get; set; }
  public Guid? JarbassAgentId { get; set; }
  public Guid ParentWorkflowId { get; set; }
  public Guid? SplitGroupId { get; set; }
  public Guid? SourceWorkflowTypeConfigId { get; set; }
  public Guid JoinWorkflowTypeConfigId { get; set; }
  public Guid? WorkflowTypeConfigConditionId { get; set; }
  public string WatcherType { get; set; } = "SplitJoinBarrier";
  public string MergeMode { get; set; } = "WaitAll";
  public int ExpectedBranchesCount { get; set; } = 1;
  public int CompletedBranchesCount { get; set; }
  public int FailedBranchesCount { get; set; }
  public bool HoldTargetInactive { get; set; } = true;
  public int PollIntervalSeconds { get; set; } = 15;
  public DateTime NextPollAtUtc { get; set; } = DateTime.UtcNow;
  public DateTime? LastPolledAtUtc { get; set; }
  public DateTime? TimeoutAtUtc { get; set; }
  public int RetryCount { get; set; }
  public int MaxRetries { get; set; } = 3;
  public string WatcherStatus { get; set; } = "Watching";
  public DateTime? JoinedAtUtc { get; set; }
  public DateTime? EffectiveTrustedJoinedAtUtc { get; set; }
  public bool CompletedOfflineOnTime { get; set; }
  public string? BlockingBranchSummary { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual JarbassAgent? JarbassAgent { get; set; }
  public virtual Workflow? ParentWorkflow { get; set; }
  public virtual WorkflowTypeConfig? SourceWorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfig? JoinWorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfigCondition? WorkflowTypeConfigCondition { get; set; }
}
