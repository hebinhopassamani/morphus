using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxRoute : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? ApplicationId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public required string Name { get; set; }
  public required string Label { get; set; }
  public required string Path { get; set; }
  public bool IsPublic { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual MpxApplication? Application { get; set; }
  public virtual SecModule? Module { get; set; }
  public virtual SecSubModule? SubModule { get; set; }
  public virtual ICollection<MpxMenu> Menus { get; set; } = [];
  public virtual ICollection<WkfType> TriggerWorkflowTypes { get; set; } = [];
  public virtual ICollection<WkfTypeConfig> RedirectWorkflowConfigs { get; set; } = [];
}
