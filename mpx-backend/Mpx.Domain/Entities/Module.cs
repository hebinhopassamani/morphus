using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class Module : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual Application? Application { get; set; }
  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<SubModule> SubModules { get; set; } = [];
  public virtual ICollection<Role> Roles { get; set; } = [];
  public virtual ICollection<Claim> Claims { get; set; } = [];
}

