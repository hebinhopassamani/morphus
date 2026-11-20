using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTypeConfig : MpxEntity, IMpxTenant
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

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowType? WorkflowType { get; set; }
  public virtual Station? Station { get; set; }

  public virtual ICollection<WorkflowTypeConfigAction> Actions { get; set; } = [];
  public virtual ICollection<WorkflowTypeConfigCondition> Conditions { get; set; } = [];
  public virtual ICollection<WorkflowTypeConfigField> Fields { get; set; } = [];
  public virtual ICollection<WorkflowTypeConfigValidation> Validations { get; set; } = [];
  public virtual ICollection<WorkflowTypeConfigSla> Slas { get; set; } = [];
  public virtual ICollection<WorkflowTypeConfigNotification> Notifications { get; set; } = [];
  public virtual ICollection<WorkflowPermission> Permissions { get; set; } = [];
}
