using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class Module : MorphusEntity
{
  public Module()
  {
    Claims = [];
    Roles = [];
    SubModules = [];
  }

  public string? Name { get; set; }
  public string? Key { get; set; }
  public bool System { get; set; }
  public Guid? BusinessId { get; set; }
  public string? Description { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Business? Business { get; set; }

  public List<Claim> Claims { get; set; }
  public List<Role> Roles { get; set; }
  public List<SubModule> SubModules { get; set; }
}
