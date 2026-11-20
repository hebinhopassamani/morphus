using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowPermission : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeId { get; set; }
  public Guid? WorkflowTypeConfigId { get; set; }
  public Guid? WorkflowTypeConfigActionId { get; set; }
  public Guid? WorkflowTypeConfigFieldId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? RoleId { get; set; }
  public Guid? ClaimId { get; set; }
  public Guid? UserId { get; set; }
  public bool CanView { get; set; } = true;
  public bool CanEdit { get; set; }
  public bool CanExecute { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowType? WorkflowType { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfigAction? WorkflowTypeConfigAction { get; set; }
  public virtual WorkflowTypeConfigField? WorkflowTypeConfigField { get; set; }
  public virtual Workspace? Workspace { get; set; }
  public virtual Role? Role { get; set; }
  public virtual Claim? Claim { get; set; }
  public virtual User? User { get; set; }
}
