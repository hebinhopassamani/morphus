using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class WkfStationType : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public WkfStationTypeEnum Code { get; set; } = WkfStationTypeEnum.Screen;
  public required string Name { get; set; }
  public required string Label { get; set; }
  public bool IsInputPort { get; set; }
  public bool IsOutputPort { get; set; }
  public bool IsIsolatedErrorCatcher { get; set; }
  public bool HasLayout { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<WkfStation> Stations { get; set; } = [];
}
