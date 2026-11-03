namespace Mpx.Domain.Entities;

public class UserClaim : MorphusRelatedEntity
{
  public Guid UserId { get; set; }
  public Guid ClaimId { get; set; }

  public virtual User? User { get; set; }
  public virtual Claim? Claim { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
