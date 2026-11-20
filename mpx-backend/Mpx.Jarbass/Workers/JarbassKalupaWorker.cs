using System.Text;
using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Infrastructure.Data.Core;
using Mpx.Jarbass.Security;
using Mpx.Jarbass.Workers.Base;

namespace Mpx.Jarbass.Workers;

public sealed class JarbassKalupaWorker(
    ILogger<JarbassKalupaWorker> logger,
    IServiceProvider serviceProvider,
    IConfiguration configuration,
    JarbassFileVaultGuardian vaultGuardian,
    JarbassDocumentSecurityGuard securityGuard)
    : MpxJarbassWorker(logger, serviceProvider, configuration, "Kalupa", defaultIntervalSeconds: 10)
{
  protected override async Task ExecuteCycleAsync(IServiceProvider scopedProvider, CancellationToken stoppingToken)
  {
    var dbContext = scopedProvider.GetRequiredService<MpxDbContext>();
    var masterSecret = Configuration["Jarbass:VaultMasterSecret"] ?? "Morphus#Jarbass#VaultGuardian#CIA#2026!";
    var nowUtc = DateTime.UtcNow;
    var isOnline = await dbContext.Database.CanConnectAsync(stoppingToken);

    var heldFiles = await dbContext.JarbassProtectedFiles
        .Include(f => f.FileType)
          .ThenInclude(ft => ft!.SecurityLevel)
        .Include(f => f.SecurityScope)
        .Include(f => f.InstanceSecurityLevel)
        .Include(f => f.EffectiveSecurityLevel)
        .Include(f => f.PermissionLevel)
        .Include(f => f.EncryptionState)
        .Where(f => !f.Inactive && f.IsHeldInHand)
        .ToListAsync(stoppingToken);

    foreach (var file in heldFiles)
    {
      var decision = await securityGuard.EvaluateDocumentAccessAsync(dbContext, file, isOnline, masterSecret, stoppingToken);

      // Nível com JarbassShouldIgnore = true: Totalmente liberado — o Jarbass nem olha!
      if (decision.JarbassShouldIgnore)
      {
        continue;
      }

      if (decision.SignatureTampered)
      {
        await RestoreAndLockOnTamperAsync(dbContext, file, masterSecret, decision.Reason, stoppingToken);
        continue;
      }

      // Se o nível de segurança (ex.: StrictOnline sem internet ou permissão User/Role/Claim revogada) reprovar: fecha na cara do usuário!
      if (!decision.Allowed)
      {
        await LockAndCloseInFaceAsync(dbContext, file, masterSecret, decision.Reason, stoppingToken);
        continue;
      }

      var leaseExpired = file.LeaseExpiresAtUtc.HasValue && file.LeaseExpiresAtUtc.Value <= nowUtc;

      if (file.ForceCloseRequested || leaseExpired)
      {
        await LockAndCloseInFaceAsync(dbContext, file, masterSecret,
            file.ForceCloseRequested ? "Permissão revogada ou fechamento forçado pelo Jarbass." : "Tempo de leitura (Lease) expirado.",
            stoppingToken);
        continue;
      }

      if (!File.Exists(file.FullLocalPath))
      {
        // O usuário tentou mover, renomear ou tomar o arquivo da mão do Jarbass!
        await RestoreAndLockOnTamperAsync(dbContext, file, masterSecret,
            "Tentativa de remover/tomar o arquivo da custódia do Jarbass detectada.",
            stoppingToken);
        continue;
      }

      // Verifica pela tabela 1:N JarbassPermissionLevel se a escrita é proibida (AllowWrite == false)
      var allowWrite = file.PermissionLevel?.AllowWrite ?? false;
      if (!allowWrite)
      {
        var currentBytes = await File.ReadAllBytesAsync(file.FullLocalPath, stoppingToken);
        var currentHash = vaultGuardian.ComputeSha256(currentBytes);

        if (!string.Equals(currentHash, file.PlaintextContentHash, StringComparison.OrdinalIgnoreCase))
        {
          // O usuário tentou editar o arquivo aberto em modo Somente Leitura (AllowWrite = false)!
          await RestoreAndLockOnTamperAsync(dbContext, file, masterSecret,
              "Tentativa não autorizada de modificação em arquivo Somente Leitura sob custódia do Jarbass.",
              stoppingToken);
        }
      }
    }
  }

  private async Task LockAndCloseInFaceAsync(
      MpxDbContext dbContext,
      JarbassProtectedFile file,
      string masterSecret,
      string reason,
      CancellationToken stoppingToken,
      bool isTamperLock = false)
  {
    var targetStateCode = isTamperLock
        ? Mpx.Domain.Enums.JarbassEncryptionStateEnum.LockedOnTamper
        : Mpx.Domain.Enums.JarbassEncryptionStateEnum.EncryptedAtRest;
    var targetState = await dbContext.JarbassEncryptionStates
        .AsNoTracking()
        .FirstOrDefaultAsync(s => s.Code == targetStateCode, stoppingToken);

    if (!string.IsNullOrWhiteSpace(file.EncryptedBackupPayload) && !string.IsNullOrWhiteSpace(file.FullLocalPath))
    {
      var dir = Path.GetDirectoryName(file.FullLocalPath);
      if (!string.IsNullOrWhiteSpace(dir))
      {
        Directory.CreateDirectory(dir);
      }
      await File.WriteAllTextAsync(file.FullLocalPath, file.EncryptedBackupPayload, Encoding.UTF8, stoppingToken);
    }
    else if (File.Exists(file.FullLocalPath) && !vaultGuardian.IsFileEncryptedEnvelope(file.FullLocalPath))
    {
      var plainBytes = await File.ReadAllBytesAsync(file.FullLocalPath, stoppingToken);
      var doubleSigned = securityGuard.SealDocumentForTransportAndRest(file, plainBytes, masterSecret, targetState?.Id);
      await File.WriteAllTextAsync(file.FullLocalPath, doubleSigned.CombinedDiskFileContent, Encoding.UTF8, stoppingToken);
    }

    file.IsHeldInHand = false;
    file.ForceCloseRequested = false;
    if (targetState is not null)
    {
      file.EncryptionStateId = targetState.Id;
    }
    file.LastRevokedReason = reason;

    await dbContext.SaveChangesAsync(stoppingToken);
    Logger.LogWarning("[Jarbass:Kalupa] Arquivo '{FileName}' FECHADO E RECRIPTOGRAFADO pelo Jarbass. Motivo: {Reason}", file.FileName, reason);
  }

  private async Task RestoreAndLockOnTamperAsync(
      MpxDbContext dbContext,
      JarbassProtectedFile file,
      string masterSecret,
      string reason,
      CancellationToken stoppingToken)
  {
    file.TamperAttemptsCount += 1;
    file.LastTamperAttemptUtc = DateTime.UtcNow;

    await LockAndCloseInFaceAsync(dbContext, file, masterSecret, reason, stoppingToken, isTamperLock: true);

    dbContext.JarbassInsights.Add(new JarbassInsight
    {
      Id = Guid.CreateVersion7(),
      CorporationId = file.CorporationId,
      JarbassAgentId = file.JarbassAgentId,
      TargetEntityId = file.Id,
      Category = "KalupaVaultSecurity",
      Severity = "Critical",
      Code = "KALUPA_FILE_TAMPER_BLOCKED",
      Title = $"Jarbass fechou e trancou o arquivo '{file.FileName}' na cara do usuário",
      Details = $"{reason} Caminho: {file.RelativeVaultPath}. Tentativas acumuladas: {file.TamperAttemptsCount}.",
      AutoHealed = true,
      AutoHealAction = "Conteúdo original restaurado e arquivo recriptografado com Dupla Assinatura Digital (LockedOnTamper).",
      OccurredAtUtc = DateTime.UtcNow,
      System = true
    });

    await dbContext.SaveChangesAsync(stoppingToken);
  }
}
