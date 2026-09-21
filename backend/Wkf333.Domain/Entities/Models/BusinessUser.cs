namespace Morphus.Domain.Entities.Models;

public class BusinessUser
{
  public Guid? BusinessId { get; set; }
  public Guid? UserId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }
  public bool IsOwner { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Business? Business { get; set; }
  public User? User { get; set; }
}
