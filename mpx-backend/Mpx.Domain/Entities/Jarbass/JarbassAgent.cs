using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JarbassAgent : MpxEntity
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

  public virtual Corporation? Corporation { get; set; }
  public virtual Workspace? Workspace { get; set; }
  public virtual User? User { get; set; }
  public virtual ICollection<JarbassJob> Jobs { get; set; } = [];
  public virtual ICollection<JarbassConfig> Configs { get; set; } = [];
  public virtual ICollection<JarbassSyncEvent> SyncEvents { get; set; } = [];
  public virtual ICollection<JarbassConflictAlert> ConflictAlerts { get; set; } = [];
  public virtual ICollection<JarbassInsight> Insights { get; set; } = [];
  public virtual ICollection<JarbassProtectedFile> ProtectedFiles { get; set; } = [];
  public virtual ICollection<JarbassWorkflowWatcher> WorkflowWatchers { get; set; } = [];
}
