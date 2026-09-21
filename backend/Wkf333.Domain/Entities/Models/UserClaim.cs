namespace Morphus.Domain.Entities.Models;

public class UserClaim
{
  public Guid? ClaimId { get; set; }
  public Guid? UserId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Claim? Claim { get; set; }
  public User? User { get; set; }
}
