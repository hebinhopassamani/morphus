using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxMenu : MpxEntity, IMpxTenant
{
  public required string Label { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public int Order { get; set; }
  public Guid CorporationId { get; set; }
  public string? Url { get; set; }
  public string? Icon { get; set; }
  public string? Description { get; set; }
  public Guid? MenuId { get; set; }

  public virtual MpxApplication? Application { get; set; }
  public virtual SecModule? Module { get; set; }
  public virtual SecSubModule? SubModule { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }

  public virtual MpxMenu? ParentMenu { get; set; }
  public virtual ICollection<MpxMenu> SubMenus { get; set; } = [];
}

