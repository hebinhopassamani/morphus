using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class SecModule : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual MpxApplication? Application { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<SecSubModule> SubModules { get; set; } = [];
  public virtual ICollection<SecRole> Roles { get; set; } = [];
  public virtual ICollection<SecClaim> Claims { get; set; } = [];
}

