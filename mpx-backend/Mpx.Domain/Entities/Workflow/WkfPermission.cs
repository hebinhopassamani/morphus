using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfPermission : MpxEntity, IMpxTenant
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

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfType? WorkflowType { get; set; }
  public virtual WkfTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WkfTypeConfigAction? WorkflowTypeConfigAction { get; set; }
  public virtual WkfTypeConfigField? WorkflowTypeConfigField { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual SecRole? Role { get; set; }
  public virtual SecClaim? Claim { get; set; }
  public virtual SecUser? User { get; set; }
}
