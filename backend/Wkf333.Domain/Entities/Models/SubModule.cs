using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class SubModule : MorphusEntity
{
  public SubModule()
  {
    Claims = [];
    Roles = [];
  }

  public string? Name { get; set; }
  public string? Key { get; set; }
  public bool System { get; set; }
  public Guid? ModuleId { get; set; }
  public string? Description { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Module? Module { get; set; }
  public List<Claim> Claims { get; set; }
  public List<Role> Roles { get; set; }
}
