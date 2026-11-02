using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class UserClaim : IMorphusTenant
{
  public Guid UserId { get; set; }
  public Guid ClaimId { get; set; }
  public Guid CorporationId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }

  public virtual User? User { get; set; }
  public virtual Claim? Claim { get; set; }
  public virtual Corporation? Corporation { get; set; }
}

