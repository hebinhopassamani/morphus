using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JarbassProtectedFile : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? JarbassAgentId { get; set; }
  public Guid? CurrentHolderUserId { get; set; }
  public string FileName { get; set; } = string.Empty;
  public string RelativeVaultPath { get; set; } = string.Empty;
  public string FullLocalPath { get; set; } = string.Empty;
  public string? RequiredClaimKey { get; set; }
  public string PermissionLevel { get; set; } = "ReadOnly";
  public string EncryptionState { get; set; } = "EncryptedAtRest";
  public string PlaintextContentHash { get; set; } = string.Empty;
  public string EncryptedContentHash { get; set; } = string.Empty;
  public string? FileKeyEncrypted { get; set; }
  public string? EncryptedBackupPayload { get; set; }
  public bool IsHeldInHand { get; set; }
  public DateTime? LeaseOpenedAtUtc { get; set; }
  public DateTime? LeaseExpiresAtUtc { get; set; }
  public bool ForceCloseRequested { get; set; }
  public int TamperAttemptsCount { get; set; }
  public DateTime? LastTamperAttemptUtc { get; set; }
  public string? LastRevokedReason { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Workspace? Workspace { get; set; }
  public virtual JarbassAgent? JarbassAgent { get; set; }
  public virtual User? CurrentHolderUser { get; set; }
}
