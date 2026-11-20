using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class RoleClaim : MpxRelatedEntity
{
  public Guid RoleId { get; set; }
  public Guid ClaimId { get; set; }

  public virtual Role? Role { get; set; }
  public virtual Claim? Claim { get; set; }
  public virtual Corporation? Corporation { get; set; }
}

