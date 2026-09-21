namespace Morphus.Domain.Entities.Models;

public class RoleClaim
{
  public Guid? RoleId { get; set; }
  public Guid? ClaimId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Role? Role { get; set; }
  public Claim? Claim { get; set; }
}
