using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JarbassConflictAlert : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid JarbassSyncEventId { get; set; }
  public Guid RejectedJarbassAgentId { get; set; }
  public Guid? WinnerJarbassAgentId { get; set; }
  public Guid? NotifyUserId { get; set; }
  public Guid? EntityDefinitionId { get; set; }
  public string EntityName { get; set; } = string.Empty;
  public Guid ExistingEntityId { get; set; }
  public Guid RejectedEntityId { get; set; }
  public string UniqueKeyName { get; set; } = string.Empty;
  public string UniqueKeyValue { get; set; } = string.Empty;
  public string Message { get; set; } = string.Empty;
  public string? RejectedPayloadJson { get; set; }
  public string ResolutionStatus { get; set; } = "PendingUserAction";
  public DateTime DetectedAtUtc { get; set; }
  public DateTime? ResolvedAtUtc { get; set; }
  public Guid? ResolvedByUserId { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual JarbassSyncEvent? JarbassSyncEvent { get; set; }
  public virtual JarbassAgent? RejectedJarbassAgent { get; set; }
  public virtual JarbassAgent? WinnerJarbassAgent { get; set; }
  public virtual User? NotifyUser { get; set; }
  public virtual User? ResolvedByUser { get; set; }
  public virtual EntityDefinition? EntityDefinition { get; set; }
}
