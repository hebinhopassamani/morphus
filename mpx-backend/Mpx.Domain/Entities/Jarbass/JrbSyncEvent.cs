using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JrbSyncEvent : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid JarbassAgentId { get; set; }
  public Guid? ParentSyncEventId { get; set; }
  public Guid? UserId { get; set; }
  public long SequenceNumber { get; set; }
  public Guid TransactionGroupId { get; set; }
  public string Operation { get; set; } = "Create";
  public Guid? EntityDefinitionId { get; set; }
  public string EntityName { get; set; } = string.Empty;
  public string TableName { get; set; } = string.Empty;
  public Guid TargetEntityId { get; set; }
  public string? TargetEntityKey { get; set; }
  public string? UniqueKeyName { get; set; }
  public string? UniqueKeyValue { get; set; }
  public string? PayloadJson { get; set; }
  public string? ChangedFieldsJson { get; set; }
  public string? EfCommandText { get; set; }
  public string? EfParametersJson { get; set; }

  // Metadados Genéricos: ONDE & COMO
  public string MachineName { get; set; } = string.Empty;
  public string EnvironmentMode { get; set; } = "Server";
  public string ExecutionChannel { get; set; } = "DirectEntity";
  public string? SourceEndpoint { get; set; }
  public string? IpAddress { get; set; }

  // Metadados Genéricos: QUANDO & QUANTO TEMPO LEVOU
  public DateTime ReportedDeviceUtc { get; set; }
  public DateTime TrustedOccurredAtUtc { get; set; }
  public DateTime? ExecutionStartedAtUtc { get; set; }
  public DateTime? ExecutionCompletedAtUtc { get; set; }
  public long? ExecutionDurationMs { get; set; }
  public long CpuTickAtEvent { get; set; }
  public bool ClockTampered { get; set; }
  public int? ClockSkewSeconds { get; set; }

  // Metadados Genéricos: EXECUTOU? FOI OK? SINCRONIZOU?
  public bool Executed { get; set; }
  public bool ExecutionSucceeded { get; set; }
  public bool Synced { get; set; }
  public int? RowsAffected { get; set; }
  public int RetryCount { get; set; }
  public string? PreviousHash { get; set; }
  public string Hash { get; set; } = string.Empty;
  public string SyncStatus { get; set; } = "Pending";
  public DateTime? SyncedAtUtc { get; set; }
  public string? ErrorMessage { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual JrbAgent? JarbassAgent { get; set; }
  public virtual JrbSyncEvent? ParentSyncEvent { get; set; }
  public virtual SecUser? User { get; set; }
  public virtual MpxEntityDefinition? EntityDefinition { get; set; }
  public virtual ICollection<JrbSyncEvent> ChildSyncEvents { get; set; } = [];
  public virtual ICollection<JrbConflictAlert> ConflictAlerts { get; set; } = [];
}
