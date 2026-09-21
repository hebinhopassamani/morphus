using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class Role : MorphusEntity
{
  public Role()
  {
    UserRoles = [];
    RoleClaims = [];
  }

  public string? Name { get; set; }
  public string? Key { get; set; }
  public bool System { get; set; }
  public Guid? BusinessId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public string? Description { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Business? Business { get; set; }
  public Module? Module { get; set; }
  public SubModule? SubModule { get; set; }

  public List<UserRole> UserRoles { get; set; }
  public List<RoleClaim> RoleClaims { get; set; }
}
