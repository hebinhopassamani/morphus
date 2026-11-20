using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class Notification : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? ApplicationId { get; set; }
  public Guid? CreatedByUserId { get; set; }
  public Guid? JarbassAgentId { get; set; }
  public Guid? EntityDefinitionId { get; set; }
  public Guid? TargetEntityId { get; set; }
  public Guid? WorkflowId { get; set; }
  public Guid? WorkflowTaskId { get; set; }
  public Guid? JarbassConflictAlertId { get; set; }
  public Guid? JarbassInsightId { get; set; }
  public string SourceModule { get; set; } = "Jarbass";
  public string Category { get; set; } = "System";
  public string Severity { get; set; } = "Info";
  public string Title { get; set; } = string.Empty;
  public string Message { get; set; } = string.Empty;
  public string? ActionLabel { get; set; }
  public string? ActionUrl { get; set; }
  public string? PayloadJson { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
  public DateTime? ExpiresAtUtc { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Workspace? Workspace { get; set; }
  public virtual Application? Application { get; set; }
  public virtual User? CreatedByUser { get; set; }
  public virtual JarbassAgent? JarbassAgent { get; set; }
  public virtual EntityDefinition? EntityDefinition { get; set; }
  public virtual Workflow? Workflow { get; set; }
  public virtual WorkflowTask? WorkflowTask { get; set; }
  public virtual JarbassConflictAlert? JarbassConflictAlert { get; set; }
  public virtual JarbassInsight? JarbassInsight { get; set; }

  public virtual ICollection<UserNotification> UserNotifications { get; set; } = [];
}
