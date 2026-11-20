using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class SecSubModule : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public Guid ModuleId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual SecModule? Module { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<SecRole> Roles { get; set; } = [];
  public virtual ICollection<SecClaim> Claims { get; set; } = [];
}

