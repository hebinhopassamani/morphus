using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowType : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public Guid CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? ApplicationId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public Guid? RootEntityDefinitionId { get; set; }
  public string? EntityName { get; set; }
  public string TriggerType { get; set; } = "Internal";
  public double ViewportX { get; set; }
  public double ViewportY { get; set; }
  public double ViewportZoom { get; set; } = 1.0;
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Workspace? Workspace { get; set; }
  public virtual Application? Application { get; set; }
  public virtual Module? Module { get; set; }
  public virtual SubModule? SubModule { get; set; }
  public virtual EntityDefinition? RootEntityDefinition { get; set; }

  public virtual ICollection<WorkflowTypeContext> Contexts { get; set; } = [];
  public virtual ICollection<WorkflowTypeConfig> Configs { get; set; } = [];
  public virtual ICollection<WorkflowPermission> Permissions { get; set; } = [];
  public virtual ICollection<Workflow> Workflows { get; set; } = [];
}
