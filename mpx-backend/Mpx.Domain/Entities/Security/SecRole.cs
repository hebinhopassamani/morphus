using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class SecRole : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public string? Email { get; set; }
  public Guid CorporationId { get; set; }
  public Guid ModuleId { get; set; }
  public Guid SubModuleId { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual SecModule? Module { get; set; }
  public virtual SecSubModule? SubModule { get; set; }

  public virtual ICollection<SecUserRole> UserRoles { get; set; } = [];
  public virtual ICollection<SecRoleClaim> RoleClaims { get; set; } = [];
}

