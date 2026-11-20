using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class Claim : MpxEntity, IMpxTenant
{
  public required string ClaimType { get; set; }
  public required string ClaimValue { get; set; }
  public Guid CorporationId { get; set; }
  public Guid ModuleId { get; set; }
  public Guid SubModuleId { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Module? Module { get; set; }
  public virtual SubModule? SubModule { get; set; }

  public virtual ICollection<RoleClaim> RoleClaims { get; set; } = [];
  public virtual ICollection<UserClaim> UserClaims { get; set; } = [];
}

