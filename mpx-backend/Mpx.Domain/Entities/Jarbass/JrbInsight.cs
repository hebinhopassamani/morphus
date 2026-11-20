using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class JrbInsight : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? JarbassAgentId { get; set; }
  public Guid? EntityDefinitionId { get; set; }
  public Guid? TargetEntityId { get; set; }
  public string Category { get; set; } = "Prevention";
  public string Severity { get; set; } = "Info";
  public string Code { get; set; } = string.Empty;
  public string Title { get; set; } = string.Empty;
  public string Details { get; set; } = string.Empty;
  public bool AutoHealed { get; set; }
  public string? AutoHealAction { get; set; }
  public DateTime OccurredAtUtc { get; set; }
  public bool Acknowledged { get; set; }
  public DateTime? AcknowledgedAtUtc { get; set; }
  public Guid? AcknowledgedByUserId { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual JrbAgent? JarbassAgent { get; set; }
  public virtual MpxEntityDefinition? EntityDefinition { get; set; }
  public virtual SecUser? AcknowledgedByUser { get; set; }
}
