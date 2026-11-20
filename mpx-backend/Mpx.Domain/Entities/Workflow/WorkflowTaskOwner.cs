using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTaskOwner : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTaskId { get; set; }
  public Guid UserId { get; set; }
  public bool IsRapporteur { get; set; }
  public Guid? WorkflowTypeConfigActionId { get; set; }
  public bool? FollowedRapporteur { get; set; }
  public string? Opinion { get; set; }
  public string? IpAddress { get; set; }
  public string? UserAgent { get; set; }
  public DateTime ClaimedAt { get; set; } = DateTime.UtcNow;
  public DateTime? ReleasedAt { get; set; }
  public Guid? TransferredToUserId { get; set; }
  public string? ReleaseReason { get; set; }
  public DateTime? CompletedAt { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowTask? WorkflowTask { get; set; }
  public virtual User? User { get; set; }
  public virtual User? TransferredToUser { get; set; }
  public virtual WorkflowTypeConfigAction? WorkflowTypeConfigAction { get; set; }
}
