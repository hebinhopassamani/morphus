using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Infrastructure.Data.Core;

namespace Mpx.Jarbass.Security;

public sealed record JarbassSealedDocumentMetadata(
    Guid DocumentId,
    Guid? FileTypeId,
    Guid? SecurityScopeId,
    Mpx.Domain.Enums.JarbassSecurityScopeEnum SecurityScopeCode,
    bool ApplyToInstance,
    Guid? SecurityLevelId,
    Mpx.Domain.Enums.JarbassSecurityLevelEnum SecurityLevelCode,
    bool JarbassShouldIgnore,
    bool RequiresEncryptionAtRest,
    bool RequiresOnlineValidation,
    Guid? PermissionLevelId,
    Mpx.Domain.Enums.JarbassPermissionLevelEnum PermissionLevelCode,
    bool AllowRead,
    bool AllowWrite,
    string? RequiredClaimKey,
    string PlaintextContentHash,
    DateTime SealedAtTrustedUtc);

public sealed record JarbassDocumentSecurityDecision(
    bool Allowed,
    Guid? EffectiveSecurityLevelId,
    Mpx.Domain.Enums.JarbassSecurityLevelEnum EffectiveSecurityLevelCode,
    string EffectiveSecurityLevelLabel,
    Guid? EffectiveSecurityScopeId,
    bool ApplyToInstance,
    bool JarbassShouldIgnore,
    bool SignatureTampered,
    string Reason,
    DateTime EvaluatedAtUtc);

public sealed record JarbassUserSecurityMatrix(
    Guid UserId,
    string? Email,
    bool IsActive,
    List<string> RoleKeys,
    List<string> ClaimKeys,
    DateTime SnapshotUtc,
    string IntegrityHash);

public sealed class JarbassDocumentSecurityGuard(
    JarbassFileVaultGuardian vaultGuardian,
    JarbassTimeGuard timeGuard)
{
  private const string MatrixSealSecret = "Morphus#Jarbass#SecurityMatrix#CIA#2026!";

  /// <summary>
  /// Lacra o documento e seus metadados de segurança (1:N IDs + flags booleanas) com Dupla Assinatura Digital:
  /// 1) InnerContentSignature assina o conteúdo criptografado + hash do texto original;
  /// 2) OuterEnvelopeSignature assina a InnerContentSignature + o cabeçalho de metadados criptografado.
  /// No trajeto entre o escritório e a casa do usuário, NADA pode ser modificado nem no texto nem nos metadados!
  /// </summary>
  public JarbassDoubleSignedEnvelope SealDocumentForTransportAndRest(
      JarbassProtectedFile file,
      byte[] plaintextBytes,
      string masterSecret,
      Guid? encryptedAtRestStateId = null)
  {
    var effectiveLevel = file.ResolveEffectiveSecurityLevelEntity();
    var applyToInstance = file.SecurityScope?.ApplyToInstance ?? false;
    var stamp = timeGuard.StampEvent($"SEAL_DOC|{file.Id}|{file.SecurityScopeId}|{effectiveLevel?.Id}");
    var plaintextHash = vaultGuardian.ComputeSha256(plaintextBytes);

    var metadata = new JarbassSealedDocumentMetadata(
        DocumentId: file.Id,
        FileTypeId: file.FileTypeId,
        SecurityScopeId: file.SecurityScopeId,
        SecurityScopeCode: file.SecurityScope?.Code ?? Mpx.Domain.Enums.JarbassSecurityScopeEnum.ByDocumentType,
        ApplyToInstance: applyToInstance,
        SecurityLevelId: effectiveLevel?.Id ?? file.ResolveEffectiveSecurityLevelId(),
        SecurityLevelCode: effectiveLevel?.Code ?? Mpx.Domain.Enums.JarbassSecurityLevelEnum.ProtectedOffline,
        JarbassShouldIgnore: effectiveLevel?.JarbassShouldIgnore ?? false,
        RequiresEncryptionAtRest: effectiveLevel?.RequiresEncryptionAtRest ?? true,
        RequiresOnlineValidation: effectiveLevel?.RequiresOnlineValidation ?? false,
        PermissionLevelId: file.PermissionLevelId,
        PermissionLevelCode: file.PermissionLevel?.Code ?? Mpx.Domain.Enums.JarbassPermissionLevelEnum.ReadOnly,
        AllowRead: file.PermissionLevel?.AllowRead ?? true,
        AllowWrite: file.PermissionLevel?.AllowWrite ?? false,
        RequiredClaimKey: file.RequiredClaimKey,
        PlaintextContentHash: plaintextHash,
        SealedAtTrustedUtc: stamp.TrustedOccurredAtUtc);

    var metadataBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(metadata));
    var doubleSigned = vaultGuardian.SealWithDoubleDigitalSignature(plaintextBytes, metadataBytes, masterSecret);

    file.PlaintextContentHash = plaintextHash;
    file.EncryptedMetadataHeader = doubleSigned.EncryptedMetadataHeader;
    file.InnerContentSignature = doubleSigned.InnerContentSignature;
    file.OuterEnvelopeSignature = doubleSigned.OuterEnvelopeSignature;
    file.EncryptedBackupPayload = doubleSigned.CombinedDiskFileContent;
    file.EncryptedContentHash = vaultGuardian.ComputeSha256(doubleSigned.CombinedDiskFileContent);
    if (encryptedAtRestStateId.HasValue)
    {
      file.EncryptionStateId = encryptedAtRestStateId.Value;
    }

    return doubleSigned;
  }

  /// <summary>
  /// Quando o usuário pede para o Jarbass abrir o documento (ou quando o documento chega na máquina),
  /// o Jarbass valida a Assinatura Digital #2 (Outer) da Assinatura Digital #1 (Inner) e extrai os metadados
  /// criptografados localmente sem precisar bater no servidor para saber o nível do documento!
  /// </summary>
  public (bool IsValid, string? TamperReason, JarbassSealedDocumentMetadata? Metadata) VerifyAndExtractSealedMetadataLocally(
      string sealedDiskFileContent,
      string masterSecret)
  {
    var inspection = vaultGuardian.VerifyDoubleSignatureAndExtractMetadata(sealedDiskFileContent, masterSecret);
    if (!inspection.SignatureValid || inspection.DecryptedMetadataBytes is null)
    {
      return (false, inspection.FailureReason ?? "Assinatura digital dupla inválida.", null);
    }

    var metadata = JsonSerializer.Deserialize<JarbassSealedDocumentMetadata>(
        Encoding.UTF8.GetString(inspection.DecryptedMetadataBytes));

    if (metadata is null)
    {
      return (false, "Metadados internos do envelope selado inválidos.", null);
    }

    var expectedInner = vaultGuardian.ComputeHmacSha256(
        $"INNER_V2|{metadata.PlaintextContentHash}|{inspection.EncryptedContentBody}",
        masterSecret + "#INNER");

    if (!string.Equals(expectedInner, inspection.InnerContentSignature, StringComparison.OrdinalIgnoreCase))
    {
      return (false, "VIOLAÇÃO CRÍTICA: Assinatura Digital Interna (InnerContentSignature) divergente dos metadados!", null);
    }

    return (true, null, metadata);
  }

  /// <summary>
  /// Cria uma instância de documento protegido herdando (ou não) o nível de segurança do Tipo de Documento (FileType) via FKs 1:N:
  /// - Se SecurityScope.ApplyToInstance == false (Por Tipo): não fixa InstanceSecurityLevelId; o Tipo governa todos.
  /// - Se SecurityScope.ApplyToInstance == true (Por Instância Individual): copia o SecurityLevelId para a instância e a instância é SOBERANA!
  /// </summary>
  public JarbassProtectedFile CreateDocumentFromFileType(
      FileType fileType,
      string fileName,
      string relativeVaultPath,
      string fullLocalPath,
      Guid? jarbassAgentId = null,
      Guid? workspaceId = null,
      JarbassSecurityScope? individualScopeOverride = null,
      JarbassSecurityLevel? overrideInstanceSecurityLevel = null,
      Guid? defaultEncryptionStateId = null)
  {
    var effectiveScope = overrideInstanceSecurityLevel is not null && individualScopeOverride is not null
        ? individualScopeOverride
        : fileType.SecurityScope;

    var effectiveScopeId = effectiveScope?.Id ?? fileType.SecurityScopeId;
    var applyToInstance = overrideInstanceSecurityLevel is not null || (effectiveScope?.ApplyToInstance == true);

    var instanceLevel = applyToInstance
        ? (overrideInstanceSecurityLevel ?? fileType.SecurityLevel)
        : null;

    var instanceLevelId = applyToInstance
        ? (overrideInstanceSecurityLevel?.Id ?? fileType.SecurityLevelId)
        : null;

    var effectiveLevel = instanceLevel ?? fileType.SecurityLevel;
    var effectiveLevelId = instanceLevelId ?? fileType.SecurityLevelId;

    return new JarbassProtectedFile
    {
      Id = Guid.CreateVersion7(),
      CorporationId = fileType.CorporationId,
      WorkspaceId = workspaceId,
      JarbassAgentId = jarbassAgentId,
      FileTypeId = fileType.Id,
      FileType = fileType,
      FileName = fileName,
      RelativeVaultPath = relativeVaultPath,
      FullLocalPath = fullLocalPath,
      SecurityScopeId = effectiveScopeId,
      SecurityScope = effectiveScope,
      InstanceSecurityLevelId = instanceLevelId,
      InstanceSecurityLevel = instanceLevel,
      EffectiveSecurityLevelId = effectiveLevelId,
      EffectiveSecurityLevel = effectiveLevel,
      RequiredClaimKey = fileType.DefaultRequiredClaimKey,
      PermissionLevelId = fileType.DefaultPermissionLevelId,
      PermissionLevel = fileType.DefaultPermissionLevel,
      EncryptionStateId = defaultEncryptionStateId,
      IsHeldInHand = false,
      System = false,
      Inactive = false
    };
  }

  /// <summary>
  /// O "Segundo Olho" do Jarbass na máquina local (usando índice composto de Foreign Keys UUID 1:N, zero string solta!):
  /// Quando um Tipo de Documento (FileTypeId) muda de nível de segurança (newSecurityLevelId), atualiza todos os documentos
  /// daquele tipo governados pelo tipo (SecurityScopeId == byTypeScopeId), mantendo 100% intocados os documentos com proteção
  /// individual (que são soberanos)!
  /// </summary>
  public async Task<int> PropagateFileTypeSecurityLevelOnMachineAsync(
      MpxDbContext dbContext,
      Guid fileTypeId,
      Guid byTypeScopeId,
      JarbassSecurityLevel newSecurityLevel,
      Guid? jarbassAgentId = null,
      CancellationToken cancellationToken = default)
  {
    var query = dbContext.JarbassProtectedFiles
        .Where(f => !f.Inactive &&
                    f.FileTypeId == fileTypeId &&
                    f.SecurityScopeId == byTypeScopeId);

    if (jarbassAgentId.HasValue)
    {
      query = query.Where(f => f.JarbassAgentId == jarbassAgentId.Value);
    }

    var governedFiles = await query.ToListAsync(cancellationToken);
    foreach (var file in governedFiles)
    {
      file.EffectiveSecurityLevelId = newSecurityLevel.Id;
      if (newSecurityLevel.RequiresOnlineValidation && file.IsHeldInHand)
      {
        file.ForceCloseRequested = true;
        file.LastRevokedReason = $"Tipo de documento elevado para '{newSecurityLevel.Label}' (Requer Validação Online).";
      }
    }

    if (governedFiles.Count > 0)
    {
      await dbContext.SaveChangesAsync(cancellationToken);
    }

    return governedFiles.Count;
  }

  /// <summary>
  /// Permite ajustar individualmente o nível de segurança de um único documento específico via relacionamento 1:N,
  /// tornando a instância soberana independente de futuras mudanças no Tipo de Documento.
  /// </summary>
  public void OverrideIndividualDocumentSecurityLevel(
      JarbassProtectedFile document,
      JarbassSecurityScope byInstanceScope,
      JarbassSecurityLevel newSecurityLevel)
  {
    document.SecurityScopeId = byInstanceScope.Id;
    document.SecurityScope = byInstanceScope;
    document.InstanceSecurityLevelId = newSecurityLevel.Id;
    document.InstanceSecurityLevel = newSecurityLevel;
    document.EffectiveSecurityLevelId = newSecurityLevel.Id;
    document.EffectiveSecurityLevel = newSecurityLevel;
  }

  /// <summary>
  /// Monta e lacra com AES-256-GCM (a mesma criptografia dos documentos e do SQL do Entity)
  /// a matriz completa User -> UserRole -> Role -> RoleClaim + UserClaim -> Claim.
  /// </summary>
  public async Task<(JarbassUserSecurityMatrix Matrix, string EncryptedMatrixEnvelope)> BuildEncryptedUserSecurityMatrixAsync(
      MpxDbContext dbContext,
      Guid userId,
      CancellationToken cancellationToken = default)
  {
    var user = await dbContext.Users
        .AsNoTracking()
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

    if (user is null || user.Inactive)
    {
      var emptyMatrix = new JarbassUserSecurityMatrix(
          UserId: userId,
          Email: user?.Email,
          IsActive: false,
          RoleKeys: [],
          ClaimKeys: [],
          SnapshotUtc: DateTime.UtcNow,
          IntegrityHash: string.Empty);

      var emptyBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(emptyMatrix));
      return (emptyMatrix, vaultGuardian.EncryptContentAesGcm(emptyBytes, MatrixSealSecret));
    }

    var activeRoleIds = await dbContext.UserRoles
        .AsNoTracking()
        .IgnoreQueryFilters()
        .Where(ur => ur.UserId == userId && !ur.Inactive)
        .Select(ur => ur.RoleId)
        .ToListAsync(cancellationToken);

    var roles = await dbContext.Roles
        .AsNoTracking()
        .IgnoreQueryFilters()
        .Where(r => activeRoleIds.Contains(r.Id) && !r.Inactive)
        .Select(r => new { r.Id, r.Key, r.Name })
        .ToListAsync(cancellationToken);

    var validRoleIds = roles.Select(r => r.Id).ToList();

    var roleClaimIds = await dbContext.RoleClaims
        .AsNoTracking()
        .IgnoreQueryFilters()
        .Where(rc => validRoleIds.Contains(rc.RoleId) && !rc.Inactive)
        .Select(rc => rc.ClaimId)
        .ToListAsync(cancellationToken);

    var directUserClaimIds = await dbContext.UserClaims
        .AsNoTracking()
        .IgnoreQueryFilters()
        .Where(uc => uc.UserId == userId && !uc.Inactive)
        .Select(uc => uc.ClaimId)
        .ToListAsync(cancellationToken);

    var allClaimIds = roleClaimIds.Union(directUserClaimIds).Distinct().ToList();

    var claims = await dbContext.Claims
        .AsNoTracking()
        .IgnoreQueryFilters()
        .Where(c => allClaimIds.Contains(c.Id) && !c.Inactive)
        .Select(c => new { c.Key, c.ClaimType, c.ClaimValue })
        .ToListAsync(cancellationToken);

    var roleKeys = roles
        .SelectMany(r => new[] { r.Key, r.Name })
        .Where(k => !string.IsNullOrWhiteSpace(k))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToList();

    var claimKeys = claims
        .SelectMany(c => new[] { c.Key, $"{c.ClaimType}:{c.ClaimValue}", c.ClaimValue })
        .Where(k => !string.IsNullOrWhiteSpace(k))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToList();

    var stamp = timeGuard.StampEvent($"SEC_MATRIX|{userId}|{string.Join(',', roleKeys)}|{string.Join(',', claimKeys)}");

    var matrix = new JarbassUserSecurityMatrix(
        UserId: userId,
        Email: user.Email,
        IsActive: true,
        RoleKeys: roleKeys,
        ClaimKeys: claimKeys,
        SnapshotUtc: stamp.TrustedOccurredAtUtc,
        IntegrityHash: stamp.CurrentHash);

    var jsonBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(matrix));
    var encryptedEnvelope = vaultGuardian.EncryptContentAesGcm(jsonBytes, MatrixSealSecret);

    return (matrix, encryptedEnvelope);
  }

  /// <summary>
  /// Avalia o acesso ao documento validando a Dupla Assinatura Digital e os flags booleanos da tabela 1:N JarbassSecurityLevel.
  /// </summary>
  public async Task<JarbassDocumentSecurityDecision> EvaluateDocumentAccessAsync(
      MpxDbContext dbContext,
      JarbassProtectedFile file,
      bool isOnlineConnectionAvailable,
      string masterSecret,
      CancellationToken cancellationToken = default)
  {
    var nowUtc = DateTime.UtcNow;
    var applyToInstance = file.SecurityScope?.ApplyToInstance ?? false;
    var levelEntity = file.ResolveEffectiveSecurityLevelEntity();
    var levelId = levelEntity?.Id ?? file.ResolveEffectiveSecurityLevelId();
    var levelCode = levelEntity?.Code ?? Mpx.Domain.Enums.JarbassSecurityLevelEnum.ProtectedOffline;
    var levelLabel = levelEntity?.Label ?? levelCode.ToString();
    var jarbassShouldIgnore = levelEntity?.JarbassShouldIgnore ?? (levelCode == Mpx.Domain.Enums.JarbassSecurityLevelEnum.Unrestricted);
    var requiresOnlineValidation = levelEntity?.RequiresOnlineValidation ?? (levelCode == Mpx.Domain.Enums.JarbassSecurityLevelEnum.StrictOnline);

    // 1. Se existe envelope lacrado com Dupla Assinatura Digital, verifica se alguém tentou adulterar metadados/conteúdo em trânsito!
    if (!string.IsNullOrWhiteSpace(file.EncryptedBackupPayload) &&
        file.EncryptedBackupPayload.StartsWith("MPX_JRB_SEAL_V2:", StringComparison.Ordinal))
    {
      var (sigValid, tamperReason, sealedMeta) = VerifyAndExtractSealedMetadataLocally(file.EncryptedBackupPayload, masterSecret);
      if (!sigValid || sealedMeta is null)
      {
        return new JarbassDocumentSecurityDecision(
            Allowed: false,
            EffectiveSecurityLevelId: levelId,
            EffectiveSecurityLevelCode: Mpx.Domain.Enums.JarbassSecurityLevelEnum.StrictOnline,
            EffectiveSecurityLevelLabel: "StrictOnline",
            EffectiveSecurityScopeId: file.SecurityScopeId,
            ApplyToInstance: applyToInstance,
            JarbassShouldIgnore: false,
            SignatureTampered: true,
            Reason: tamperReason ?? "Assinatura digital dupla violada!",
            EvaluatedAtUtc: nowUtc);
      }

      file.SecurityScopeId = sealedMeta.SecurityScopeId;
      applyToInstance = sealedMeta.ApplyToInstance;
      if (applyToInstance)
      {
        file.InstanceSecurityLevelId = sealedMeta.SecurityLevelId;
      }
      file.EffectiveSecurityLevelId = sealedMeta.SecurityLevelId;
      levelId = sealedMeta.SecurityLevelId;
      levelCode = sealedMeta.SecurityLevelCode;
      jarbassShouldIgnore = sealedMeta.JarbassShouldIgnore;
      requiresOnlineValidation = sealedMeta.RequiresOnlineValidation;
    }

    if (jarbassShouldIgnore || levelCode == Mpx.Domain.Enums.JarbassSecurityLevelEnum.Unrestricted)
    {
      return new JarbassDocumentSecurityDecision(
          Allowed: true,
          EffectiveSecurityLevelId: levelId,
          EffectiveSecurityLevelCode: levelCode,
          EffectiveSecurityLevelLabel: levelLabel,
          EffectiveSecurityScopeId: file.SecurityScopeId,
          ApplyToInstance: applyToInstance,
          JarbassShouldIgnore: true,
          SignatureTampered: false,
          Reason: $"Nível '{levelLabel}': totalmente liberado, o Jarbass não monitora.",
          EvaluatedAtUtc: nowUtc);
    }

    if (requiresOnlineValidation || levelCode == Mpx.Domain.Enums.JarbassSecurityLevelEnum.StrictOnline)
    {
      if (!isOnlineConnectionAvailable)
      {
        return new JarbassDocumentSecurityDecision(
            Allowed: false,
            EffectiveSecurityLevelId: levelId,
            EffectiveSecurityLevelCode: levelCode,
            EffectiveSecurityLevelLabel: levelLabel,
            EffectiveSecurityScopeId: file.SecurityScopeId,
            ApplyToInstance: applyToInstance,
            JarbassShouldIgnore: false,
            SignatureTampered: false,
            Reason: $"Nível '{levelLabel}' (Mega Plus Hard Power Security): exige conexão com a internet ativa para abrir ou manter aberto.",
            EvaluatedAtUtc: nowUtc);
      }

      if (!file.CurrentHolderUserId.HasValue)
      {
        return new JarbassDocumentSecurityDecision(
            Allowed: false,
            EffectiveSecurityLevelId: levelId,
            EffectiveSecurityLevelCode: levelCode,
            EffectiveSecurityLevelLabel: levelLabel,
            EffectiveSecurityScopeId: file.SecurityScopeId,
            ApplyToInstance: applyToInstance,
            JarbassShouldIgnore: false,
            SignatureTampered: false,
            Reason: $"Nível '{levelLabel}': nenhum usuário autenticado vinculado à custódia do documento.",
            EvaluatedAtUtc: nowUtc);
      }

      var (matrix, _) = await BuildEncryptedUserSecurityMatrixAsync(dbContext, file.CurrentHolderUserId.Value, cancellationToken);
      if (!matrix.IsActive)
      {
        return new JarbassDocumentSecurityDecision(
            Allowed: false,
            EffectiveSecurityLevelId: levelId,
            EffectiveSecurityLevelCode: levelCode,
            EffectiveSecurityLevelLabel: levelLabel,
            EffectiveSecurityScopeId: file.SecurityScopeId,
            ApplyToInstance: applyToInstance,
            JarbassShouldIgnore: false,
            SignatureTampered: false,
            Reason: "Usuário inativo ou revogado na estrutura de Segurança (sec_users).",
            EvaluatedAtUtc: nowUtc);
      }

      if (!string.IsNullOrWhiteSpace(file.RequiredClaimKey) &&
          !matrix.ClaimKeys.Contains(file.RequiredClaimKey, StringComparer.OrdinalIgnoreCase) &&
          !matrix.RoleKeys.Contains(file.RequiredClaimKey, StringComparer.OrdinalIgnoreCase))
      {
        return new JarbassDocumentSecurityDecision(
            Allowed: false,
            EffectiveSecurityLevelId: levelId,
            EffectiveSecurityLevelCode: levelCode,
            EffectiveSecurityLevelLabel: levelLabel,
            EffectiveSecurityScopeId: file.SecurityScopeId,
            ApplyToInstance: applyToInstance,
            JarbassShouldIgnore: false,
            SignatureTampered: false,
            Reason: $"Permissão '{file.RequiredClaimKey}' não encontrada em UserRole/RoleClaim/UserClaim para o usuário.",
            EvaluatedAtUtc: nowUtc);
      }

      file.LastOnlineSecurityVerifiedAtUtc = nowUtc;
      return new JarbassDocumentSecurityDecision(
          Allowed: true,
          EffectiveSecurityLevelId: levelId,
          EffectiveSecurityLevelCode: levelCode,
          EffectiveSecurityLevelLabel: levelLabel,
          EffectiveSecurityScopeId: file.SecurityScopeId,
          ApplyToInstance: applyToInstance,
          JarbassShouldIgnore: false,
          SignatureTampered: false,
          Reason: $"Nível '{levelLabel}' validado ao vivo contra User/Role/UserRole/Claim/UserClaim/RoleClaim.",
          EvaluatedAtUtc: nowUtc);
    }

    // Níveis intermediários (quando há conexão, revalida se a Claim ainda pertence ao usuário)
    if (!string.IsNullOrWhiteSpace(file.RequiredClaimKey) && isOnlineConnectionAvailable && file.CurrentHolderUserId.HasValue)
    {
      var (matrix, _) = await BuildEncryptedUserSecurityMatrixAsync(dbContext, file.CurrentHolderUserId.Value, cancellationToken);
      if (!matrix.IsActive ||
          (!matrix.ClaimKeys.Contains(file.RequiredClaimKey, StringComparer.OrdinalIgnoreCase) &&
           !matrix.RoleKeys.Contains(file.RequiredClaimKey, StringComparer.OrdinalIgnoreCase)))
      {
        return new JarbassDocumentSecurityDecision(
            Allowed: false,
            EffectiveSecurityLevelId: levelId,
            EffectiveSecurityLevelCode: levelCode,
            EffectiveSecurityLevelLabel: levelLabel,
            EffectiveSecurityScopeId: file.SecurityScopeId,
            ApplyToInstance: applyToInstance,
            JarbassShouldIgnore: false,
            SignatureTampered: false,
            Reason: $"Permissão '{file.RequiredClaimKey}' revogada no servidor para este documento ('{levelLabel}').",
            EvaluatedAtUtc: nowUtc);
      }
    }

    return new JarbassDocumentSecurityDecision(
        Allowed: true,
        EffectiveSecurityLevelId: levelId,
        EffectiveSecurityLevelCode: levelCode,
        EffectiveSecurityLevelLabel: levelLabel,
        EffectiveSecurityScopeId: file.SecurityScopeId,
        ApplyToInstance: applyToInstance,
        JarbassShouldIgnore: false,
        SignatureTampered: false,
        Reason: $"Nível '{levelLabel}': custódia local válida.",
        EvaluatedAtUtc: nowUtc);
  }
}
