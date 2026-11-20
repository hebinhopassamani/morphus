using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfWorkflow : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeId { get; set; }
  public required string Protocol { get; set; }
  public Guid? ParentWorkflowId { get; set; }
  public Guid? FromWorkflowTypeConfigId { get; set; }
  public Guid ToWorkflowTypeConfigId { get; set; }
  public Guid? WorkflowTypeConfigActionId { get; set; }
  public Guid? WorkflowTypeConfigConditionId { get; set; }
  public Guid? ExecutedByUserId { get; set; }
  public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
  public string? Opinion { get; set; }
  public string? IpAddress { get; set; }
  public string? UserAgent { get; set; }
  public string Status { get; set; } = "Running";
  public bool IsCurrentStep { get; set; } = true;
  public Guid? SplitGroupId { get; set; }
  public Guid? JoinTargetConfigId { get; set; }
  public int ExpectedSplitBranches { get; set; }
  public int CompletedSplitBranches { get; set; }
  public bool WaitingForSplitJoin { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfType? WorkflowType { get; set; }
  public virtual WkfWorkflow? ParentWorkflow { get; set; }
  public virtual WkfTypeConfig? FromWorkflowTypeConfig { get; set; }
  public virtual WkfTypeConfig? ToWorkflowTypeConfig { get; set; }
  public virtual WkfTypeConfig? JoinTargetConfig { get; set; }
  public virtual WkfTypeConfigAction? WorkflowTypeConfigAction { get; set; }
  public virtual WkfTypeConfigCondition? WorkflowTypeConfigCondition { get; set; }
  public virtual SecUser? ExecutedByUser { get; set; }

  public virtual ICollection<WkfWorkflow> ChildWorkflows { get; set; } = [];
  public virtual ICollection<WkfTask> Tasks { get; set; } = [];
  public virtual ICollection<WkfItem> Items { get; set; } = [];
}
