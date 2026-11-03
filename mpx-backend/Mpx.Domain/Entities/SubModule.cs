using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class SubModule : MorphusEntity, IMorphusTenant
{
  public required string Name { get; set; }
  public Guid ModuleId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual Module? Module { get; set; }
  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<Role> Roles { get; set; } = [];
  public virtual ICollection<Claim> Claims { get; set; } = [];
}
