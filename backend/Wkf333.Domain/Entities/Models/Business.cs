using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class Business : MorphusEntity
{
  public Business()
  {
    BusinessUsers = [];
    UserStatus = [];
    Modules = [];
    Roles = [];
    Claims = [];
    Child = [];
  }

  public string? Name { get; set; }
  public string? FullName { get; set; }
  public string? Email { get; set; }
  public string? Key { get; set; }
  public bool System { get; set; }
  public Guid? BusinessId { get; set; }
  public string? Description { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Business? Parent { get; set; }

  public List<Business> Child { get; set; }
  public List<UserStatus> UserStatus { get; set; }
  public List<Module> Modules { get; set; }
  public List<Role> Roles { get; set; }
  public List<Claim> Claims { get; set; }
  public List<BusinessUser> BusinessUsers { get; set; }
}
