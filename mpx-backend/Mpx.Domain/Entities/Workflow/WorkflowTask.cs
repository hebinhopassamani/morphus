using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTask : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public Guid? TargetRoleId { get; set; }
  public Guid? TargetWorkspaceId { get; set; }
  public int MaxOwners { get; set; } = 1;
  public int CurrentOwnersCount { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime? ClaimedAt { get; set; }
  public DateTime? CompletedAt { get; set; }
  public DateTime? DueDate { get; set; }
  public int? RemainingSlaMinutes { get; set; }
  public double SlaElapsedPercent { get; set; }
  public string SlaSeverity { get; set; } = "success";
  public string SlaColor { get; set; } = "green";
  public bool SlaBreached { get; set; }
  public string Status { get; set; } = "PendingGroup";
  public int NumRetries { get; set; }
  public DateTime? NextCheckAt { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Workflow? Workflow { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual Role? TargetRole { get; set; }
  public virtual Workspace? TargetWorkspace { get; set; }
  public virtual ICollection<WorkflowTaskOwner> Owners { get; set; } = [];
}
