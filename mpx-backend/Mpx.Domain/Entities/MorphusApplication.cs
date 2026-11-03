using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class MorphusApplication : MorphusEntity, IMorphusTenant
{
  public required string Name { get; set; }
  public string? Description { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public Guid CorporationId { get; set; }
  public Guid? CategoryId { get; set; }
  public Guid? ApplicationStatusId { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Category? Category { get; set; }
  public virtual ApplicationStatus? ApplicationStatus { get; set; }
  public virtual ICollection<WorkspaceApplication> WorkspaceApplications { get; set; } = [];
  public virtual ICollection<ApplicationModule> ApplicationModules { get; set; } = [];
  public virtual ICollection<Module> Modules { get; set; } = [];
  public virtual ICollection<Menu> Menus { get; set; } = [];
  public virtual ICollection<ApplicationUser> ApplicationUsers { get; set; } = [];
}
