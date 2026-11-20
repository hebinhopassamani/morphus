using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTypeConfigSla : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public required string Severity { get; set; }
  public required string Color { get; set; }
  public int Percentage { get; set; }
  public int? RepeatIntervalMinutes { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual ICollection<WorkflowTypeConfigNotification> Notifications { get; set; } = [];
}
