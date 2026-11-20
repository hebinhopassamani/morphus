using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JrbConflictAlert : MpxEntity
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

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual JrbSyncEvent? JarbassSyncEvent { get; set; }
  public virtual JrbAgent? RejectedJarbassAgent { get; set; }
  public virtual JrbAgent? WinnerJarbassAgent { get; set; }
  public virtual SecUser? NotifyUser { get; set; }
  public virtual SecUser? ResolvedByUser { get; set; }
  public virtual MpxEntityDefinition? EntityDefinition { get; set; }
}
