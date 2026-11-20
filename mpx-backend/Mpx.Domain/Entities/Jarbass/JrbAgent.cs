using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JrbAgent : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? UserId { get; set; }
  public string Name { get; set; } = string.Empty;
  public string MachineName { get; set; } = string.Empty;
  public string? OperatingSystem { get; set; }
  public string? IpAddress { get; set; }
  public string Version { get; set; } = "1.0.0";
  public string EnvironmentMode { get; set; } = "Server";
  public string Status { get; set; } = "Online";
  public bool IsOfflineCapable { get; set; } = true;
  public DateTime? LastHeartbeatUtc { get; set; }
  public DateTime? LastTrustedServerUtc { get; set; }
  public long LastCpuTickAnchor { get; set; }
  public DateTime? HighWaterMarkUtc { get; set; }
  public string? LastChainHash { get; set; }
  public long LastSyncedSequenceNumber { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual SecUser? User { get; set; }
  public virtual ICollection<JrbJob> Jobs { get; set; } = [];
  public virtual ICollection<JrbConfig> Configs { get; set; } = [];
  public virtual ICollection<JrbSyncEvent> SyncEvents { get; set; } = [];
  public virtual ICollection<JrbConflictAlert> ConflictAlerts { get; set; } = [];
  public virtual ICollection<JrbInsight> Insights { get; set; } = [];
  public virtual ICollection<JrbProtectedFile> ProtectedFiles { get; set; } = [];
  public virtual ICollection<JrbWorkflowWatcher> WorkflowWatchers { get; set; } = [];
}
