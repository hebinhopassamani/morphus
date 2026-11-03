using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class ApplicationModule : MorphusEntity, IMorphusTenant
{
  public required string Name { get; set; }
  public required string Label { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual MorphusApplication? Application { get; set; }
  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<ApplicationSubModule> ApplicationSubModules { get; set; } = [];
}
