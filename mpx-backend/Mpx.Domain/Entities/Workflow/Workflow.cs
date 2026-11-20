using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class Workflow : MpxEntity, IMpxTenant
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

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowType? WorkflowType { get; set; }
  public virtual Workflow? ParentWorkflow { get; set; }
  public virtual WorkflowTypeConfig? FromWorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfig? ToWorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfigAction? WorkflowTypeConfigAction { get; set; }
  public virtual WorkflowTypeConfigCondition? WorkflowTypeConfigCondition { get; set; }
  public virtual User? ExecutedByUser { get; set; }

  public virtual ICollection<Workflow> ChildWorkflows { get; set; } = [];
  public virtual ICollection<WorkflowTask> Tasks { get; set; } = [];
  public virtual ICollection<WorkflowItem> Items { get; set; } = [];
}
