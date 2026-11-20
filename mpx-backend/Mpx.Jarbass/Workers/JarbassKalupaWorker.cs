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
    JarbassFileVaultGuardian vaultGuardian)
    : MpxJarbassWorker(logger, serviceProvider, configuration, "Kalupa", defaultIntervalSeconds: 10)
{
  protected override async Task ExecuteCycleAsync(IServiceProvider scopedProvider, CancellationToken stoppingToken)
  {
    var dbContext = scopedProvider.GetRequiredService<MpxDbContext>();
    var masterSecret = Configuration["Jarbass:VaultMasterSecret"] ?? "Morphus#Jarbass#VaultGuardian#CIA#2026!";
    var nowUtc = DateTime.UtcNow;

    var heldFiles = await dbContext.JarbassProtectedFiles
        .Where(f => !f.Inactive && f.IsHeldInHand)
        .ToListAsync(stoppingToken);

    foreach (var file in heldFiles)
    {
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

      if (string.Equals(file.PermissionLevel, "ReadOnly", StringComparison.OrdinalIgnoreCase))
      {
        var currentBytes = await File.ReadAllBytesAsync(file.FullLocalPath, stoppingToken);
        var currentHash = vaultGuardian.ComputeSha256(currentBytes);

        if (!string.Equals(currentHash, file.PlaintextContentHash, StringComparison.OrdinalIgnoreCase))
        {
          // O usuário tentou editar o arquivo aberto em modo Read-Only!
          await RestoreAndLockOnTamperAsync(dbContext, file, masterSecret,
              "Tentativa não autorizada de modificação em arquivo Read-Only sob custódia do Jarbass.",
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
      CancellationToken stoppingToken)
  {
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
      var encrypted = vaultGuardian.EncryptContentAesGcm(plainBytes, masterSecret);
      file.EncryptedBackupPayload = encrypted;
      file.EncryptedContentHash = vaultGuardian.ComputeSha256(encrypted);
      await File.WriteAllTextAsync(file.FullLocalPath, encrypted, Encoding.UTF8, stoppingToken);
    }

    file.IsHeldInHand = false;
    file.ForceCloseRequested = false;
    file.EncryptionState = "EncryptedAtRest";
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

    await LockAndCloseInFaceAsync(dbContext, file, masterSecret, reason, stoppingToken);

    dbContext.JarbassInsights.Add(new JarbassInsight
    {
      Id = Guid.NewGuid(),
      CorporationId = file.CorporationId,
      JarbassAgentId = file.JarbassAgentId,
      TargetEntityId = file.Id,
      Category = "KalupaVaultSecurity",
      Severity = "Critical",
      Code = "KALUPA_FILE_TAMPER_BLOCKED",
      Title = $"Jarbass fechou e trancou o arquivo '{file.FileName}' na cara do usuário",
      Details = $"{reason} Caminho: {file.RelativeVaultPath}. Tentativas acumuladas: {file.TamperAttemptsCount}.",
      AutoHealed = true,
      AutoHealAction = "Conteúdo original restaurado e arquivo recriptografado imediatamente (EncryptedAtRest).",
      OccurredAtUtc = DateTime.UtcNow,
      System = true
    });

    await dbContext.SaveChangesAsync(stoppingToken);
  }
}
