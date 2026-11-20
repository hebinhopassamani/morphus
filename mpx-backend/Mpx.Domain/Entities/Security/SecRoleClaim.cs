using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class SecRoleClaim : MpxRelatedEntity
{
  public Guid RoleId { get; set; }
  public Guid ClaimId { get; set; }

  public virtual SecRole? Role { get; set; }
  public virtual SecClaim? Claim { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
}

