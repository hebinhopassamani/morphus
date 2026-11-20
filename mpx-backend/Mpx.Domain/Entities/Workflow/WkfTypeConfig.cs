using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfTypeConfig : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeId { get; set; }
  public Guid StationId { get; set; }
  public int Order { get; set; }
  public double PositionX { get; set; }
  public double PositionY { get; set; }
  public double? Width { get; set; }
  public double? Height { get; set; }
  public bool HasLayout { get; set; }
  public string? CustomLayoutHtml { get; set; }
  public string AssignmentMode { get; set; } = "GroupQueue";
  public int MaxOwners { get; set; } = 1;
  public int? MaxTasksPerUser { get; set; }
  public double? QuorumPercentage { get; set; }
  public int? QuorumMinVotes { get; set; }
  public bool AutoAdvanceOnQuorumReached { get; set; } = true;
  public bool HasRapporteur { get; set; }
  public bool RequiresRapporteurFirst { get; set; }
  public bool RapporteurTieBreaker { get; set; }
  public int? SlaMinutes { get; set; }
  public bool HoldInactiveUntilApproved { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfType? WorkflowType { get; set; }
  public virtual WkfStation? Station { get; set; }

  public virtual ICollection<WkfTypeContext> AddedContexts { get; set; } = [];
  public virtual ICollection<WkfTypeConfigAction> Actions { get; set; } = [];
  public virtual ICollection<WkfTypeConfigCondition> Conditions { get; set; } = [];
  public virtual ICollection<WkfTypeConfigField> Fields { get; set; } = [];
  public virtual ICollection<WkfTypeConfigValidation> Validations { get; set; } = [];
  public virtual ICollection<WkfTypeConfigSla> Slas { get; set; } = [];
  public virtual ICollection<WkfTypeConfigNotification> Notifications { get; set; } = [];
  public virtual ICollection<WkfPermission> Permissions { get; set; } = [];
}
