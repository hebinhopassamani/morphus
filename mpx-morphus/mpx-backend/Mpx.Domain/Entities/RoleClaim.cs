using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class RoleClaim : IMorphusTenant
{
  public Guid RoleId { get; set; }
  public Guid ClaimId { get; set; }
  public Guid CorporationId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }

  public virtual Role? Role { get; set; }
  public virtual Claim? Claim { get; set; }
  public virtual Corporation? Corporation { get; set; }
}

