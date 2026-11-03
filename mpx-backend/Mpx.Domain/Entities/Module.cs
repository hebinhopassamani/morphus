using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class Module : MorphusEntity, IMorphusTenant
{
  public required string Name { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual MorphusApplication? Application { get; set; }
  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<SubModule> SubModules { get; set; } = [];
  public virtual ICollection<Role> Roles { get; set; } = [];
  public virtual ICollection<Claim> Claims { get; set; } = [];
}
