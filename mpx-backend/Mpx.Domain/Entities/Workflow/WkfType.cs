using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfType : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public Guid CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? ApplicationId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public Guid? RootEntityDefinitionId { get; set; }
  public string? EntityName { get; set; }
  public Guid? TriggerTypeId { get; set; }
  public Guid? TriggerRouteId { get; set; }
  public string TriggerType { get; set; } = "HtmlAction";
  public string? TriggerEvent { get; set; } = "OnScreenLoad";
  public double ViewportX { get; set; }
  public double ViewportY { get; set; }
  public double ViewportZoom { get; set; } = 1.0;
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual MpxApplication? Application { get; set; }
  public virtual SecModule? Module { get; set; }
  public virtual SecSubModule? SubModule { get; set; }
  public virtual MpxEntityDefinition? RootEntityDefinition { get; set; }
  public virtual WkfTriggerType? TriggerTypeDefinition { get; set; }
  public virtual MpxRoute? TriggerRoute { get; set; }

  public virtual ICollection<WkfTypeContext> Contexts { get; set; } = [];
  public virtual ICollection<WkfTypeConfig> Configs { get; set; } = [];
  public virtual ICollection<WkfPermission> Permissions { get; set; } = [];
  public virtual ICollection<WkfWorkflow> Workflows { get; set; } = [];
}
