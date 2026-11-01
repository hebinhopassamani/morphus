using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class Menu : IMorphusTenant
{
  public Guid Id { get; set; }
  public required string Label { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public bool System { get; set; }
  public int Order { get; set; }
  public Guid CorporationId { get; set; }
  public string? Url { get; set; }
  public string? Icon { get; set; }
  public string? Description { get; set; }
  public Guid? MenuId { get; set; }

  public virtual MorphusApplication? Application { get; set; }
  public virtual Module? Module { get; set; }
  public virtual SubModule? SubModule { get; set; }
  public virtual Corporation? Corporation { get; set; }

  public virtual Menu? ParentMenu { get; set; }
  public virtual ICollection<Menu> SubMenus { get; set; } = [];
}
