using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class MorphusApplication : IMorphusTenant
{
  public Guid Id { get; set; }
  public required string Name { get; set; }
  public required string Key { get; set; }
  public string? Description { get; set; }
  public string? Icon { get; set; }
  public bool System { get; set; }
  public bool Inactive { get; set; }
  public Guid WorkspaceId { get; set; }
  public Guid CorporationId { get; set; }

  public virtual Workspace? Workspace { get; set; }
  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<Module> Modules { get; set; } = [];
  public virtual ICollection<Menu> Menus { get; set; } = [];
  public virtual ICollection<ApplicationUser> ApplicationUsers { get; set; } = [];
}
