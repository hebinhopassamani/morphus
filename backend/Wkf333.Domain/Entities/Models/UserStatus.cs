using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class UserStatus : MorphusEntity
{
  public UserStatus()
  {
    Users = [];
  }

  public string? Name { get; set; }
  public string? Key { get; set; }
  public bool System { get; set; }
  public Guid? BusinessId { get; set; }
  public string? Description { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Business? Business { get; set; }

  public List<User> Users { get; set; }
}
