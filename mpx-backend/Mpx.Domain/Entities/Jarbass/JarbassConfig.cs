using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JarbassConfig : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? JarbassAgentId { get; set; }
  public bool IsSingleton { get; set; } = true;

  // 1. Pareamento & Autenticação com o Morphus Central (API Key)
  public string MorphusServerUrl { get; set; } = "https://api.morphus.one";
  public string? ApiKeyPrefix { get; set; }
  public string? ApiKeyHash { get; set; }
  public string? ApiKeyEncrypted { get; set; }
  public string? SigningSecretEncrypted { get; set; }
  public bool IsPaired { get; set; }
  public DateTime? PairedAtUtc { get; set; }
  public bool ApiKeyRevoked { get; set; }
  public DateTime? ApiKeyExpiresAtUtc { get; set; }

  // 2. Conexão com o Ambiente / Servidor do Cliente (On-Premise / Local)
  public string ClientDatabaseProvider { get; set; } = "PostgreSQL";
  public string? ClientDatabaseConnectionStringEncrypted { get; set; }
  public string? ClientAppFolderPath { get; set; }
  public string? KalupaVaultFolderPath { get; set; }

  // 3. Relógio Anti-Fraude & Estado do Sync (Singleton State)
  public string EnvironmentMode { get; set; } = "Server";
  public DateTime? LastTrustedServerUtc { get; set; }
  public long LastCpuTickAnchor { get; set; }
  public DateTime? HighWaterMarkUtc { get; set; }
  public string? LastChainHash { get; set; }
  public long LastSyncedSequenceNumber { get; set; }
  public int MaxAllowedClockDriftSeconds { get; set; } = 45;
  public bool BlockSyncOnClockTampering { get; set; }

  // 4. Chaves Gerais e Intervalos dos Motores do Jarbass
  public bool CatalogReflectionEnabled { get; set; } = true;
  public int CatalogReflectionIntervalSeconds { get; set; } = 60;
  public bool WorkflowWatcherEnabled { get; set; } = true;
  public int WorkflowWatcherIntervalSeconds { get; set; } = 15;
  public bool EmailDispatcherEnabled { get; set; } = true;
  public int EmailDispatcherIntervalSeconds { get; set; } = 10;
  public bool KalupaSyncEnabled { get; set; } = true;
  public int KalupaSyncIntervalSeconds { get; set; } = 15;
  public bool OfflineSyncEnabled { get; set; } = true;
  public int OfflineSyncIntervalSeconds { get; set; } = 10;
  public bool AutoHealEnabled { get; set; } = true;
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Workspace? Workspace { get; set; }
  public virtual JarbassAgent? JarbassAgent { get; set; }
}
