using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JarbassJob : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? JarbassAgentId { get; set; }
  public string Code { get; set; } = string.Empty;
  public string Name { get; set; } = string.Empty;
  public string Category { get; set; } = "System";
  public int IntervalSeconds { get; set; } = 60;
  public bool Enabled { get; set; } = true;
  public string LastRunStatus { get; set; } = "Idle";
  public DateTime? LastRunUtc { get; set; }
  public DateTime? NextRunUtc { get; set; }
  public long? LastDurationMs { get; set; }
  public long TotalRuns { get; set; }
  public long TotalFailures { get; set; }
  public string? LastErrorMessage { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual JarbassAgent? JarbassAgent { get; set; }
}
