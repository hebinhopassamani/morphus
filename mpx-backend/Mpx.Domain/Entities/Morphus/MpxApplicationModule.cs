using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxApplicationModule : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public required string Label { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual MpxApplication? Application { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxApplicationSubModule> ApplicationSubModules { get; set; } = [];
}

