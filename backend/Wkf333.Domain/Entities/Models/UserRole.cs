namespace Morphus.Domain.Entities.Models;

public class UserRole
{
  public Guid? RoleId { get; set; }
  public Guid? UserId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public User? User { get; set; }
  public Role? Role { get; set; }
}
