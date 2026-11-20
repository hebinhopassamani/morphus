using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JrbProtectedFile : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? JarbassAgentId { get; set; }
  public Guid? FileTypeId { get; set; }
  public Guid? CurrentHolderUserId { get; set; }
  public string FileName { get; set; } = string.Empty;
  public string RelativeVaultPath { get; set; } = string.Empty;
  public string FullLocalPath { get; set; } = string.Empty;

  // Relacionamentos 1:N com as Tabelas de Domínio do Jarbass (Foreign Keys UUID indexadas — 100% compatível com o App Builder!):
  public Guid? SecurityScopeId { get; set; }
  public Guid? InstanceSecurityLevelId { get; set; }
  public Guid? EffectiveSecurityLevelId { get; set; }
  public Guid? PermissionLevelId { get; set; }
  public Guid? EncryptionStateId { get; set; }

  // Dupla Assinatura Digital ("Uma assinatura digital de outra assinatura digital"):
  // 1) InnerContentSignature: HMAC-SHA256 do conteúdo criptografado + hash do texto original
  // 2) OuterEnvelopeSignature: HMAC-SHA256 que assina (InnerContentSignature + Metadados de Segurança criptografados)
  // Garante que entre o escritório e a casa do usuário NADA (nem 1 bit do texto e nem 1 bit dos metadados) possa ser alterado!
  public string? EncryptedMetadataHeader { get; set; }
  public string? InnerContentSignature { get; set; }
  public string? OuterEnvelopeSignature { get; set; }

  public string? RequiredClaimKey { get; set; }
  public string PlaintextContentHash { get; set; } = string.Empty;
  public string EncryptedContentHash { get; set; } = string.Empty;
  public string? FileKeyEncrypted { get; set; }
  public string? EncryptedBackupPayload { get; set; }
  public bool IsHeldInHand { get; set; }
  public DateTime? LeaseOpenedAtUtc { get; set; }
  public DateTime? LeaseExpiresAtUtc { get; set; }
  public DateTime? LastOnlineSecurityVerifiedAtUtc { get; set; }
  public bool ForceCloseRequested { get; set; }
  public int TamperAttemptsCount { get; set; }
  public DateTime? LastTamperAttemptUtc { get; set; }
  public string? LastRevokedReason { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual JrbAgent? JarbassAgent { get; set; }
  public virtual MpxFileType? FileType { get; set; }
  public virtual SecUser? CurrentHolderUser { get; set; }
  public virtual JrbSecurityScope? SecurityScope { get; set; }
  public virtual JrbSecurityLevel? InstanceSecurityLevel { get; set; }
  public virtual JrbSecurityLevel? EffectiveSecurityLevel { get; set; }
  public virtual JrbPermissionLevel? PermissionLevel { get; set; }
  public virtual JrbEncryptionState? EncryptionState { get; set; }

  public JarbassSecurityLevel? ResolveEffectiveSecurityLevelEntity()
  {
    if (SecurityScope?.ApplyToInstance == true && InstanceSecurityLevel is not null)
    {
      return InstanceSecurityLevel;
    }

    return FileType?.SecurityLevel ?? InstanceSecurityLevel ?? EffectiveSecurityLevel;
  }

  public Guid? ResolveEffectiveSecurityLevelId()
  {
    if (SecurityScope?.ApplyToInstance == true && InstanceSecurityLevelId.HasValue)
    {
      return InstanceSecurityLevelId;
    }

    return FileType?.SecurityLevelId ?? InstanceSecurityLevelId ?? EffectiveSecurityLevelId;
  }
}
