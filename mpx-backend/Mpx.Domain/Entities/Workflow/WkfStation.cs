using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfStation : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public required string Code { get; set; }
  public Guid CorporationId { get; set; }
  public Guid? StationTypeId { get; set; }
  public bool HasLayout { get; set; }
  public string? DefaultLayoutHtml { get; set; }
  public string? ProcessHandlerKey { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfStationType? StationType { get; set; }
  public virtual ICollection<WkfTypeConfig> WorkflowTypeConfigs { get; set; } = [];
}
