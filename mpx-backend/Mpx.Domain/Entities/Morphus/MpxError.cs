using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxError : MpxEntity, IMpxTenant
{
  public Guid ErrorCodeId { get; set; }
  public Guid ErrorStateId { get; set; }
  public Guid CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? ApplicationId { get; set; }
  public Guid? WorkflowTypeId { get; set; }
  public Guid? WorkflowId { get; set; }
  public Guid? WorkflowTaskId { get; set; }
  public Guid? OriginConfigId { get; set; }
  public Guid? UserId { get; set; }
  public required string Message { get; set; }
  public required string UserMessage { get; set; }
  public required string Method { get; set; }
  public string? UserSnapshot { get; set; }
  public string? ContextSnapshot { get; set; }
  public Guid? ResolvedByUserId { get; set; }
  public DateTime? ResolvedAt { get; set; }
  public string? ResolutionNotes { get; set; }

  public virtual MpxErrorCode? ErrorCode { get; set; }
  public virtual MpxErrorState? ErrorState { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual MpxApplication? Application { get; set; }
  public virtual WkfType? WorkflowType { get; set; }
  public virtual WkfWorkflow? Workflow { get; set; }
  public virtual WkfTask? WorkflowTask { get; set; }
  public virtual WkfTypeConfig? OriginConfig { get; set; }
  public virtual SecUser? User { get; set; }
  public virtual SecUser? ResolvedByUser { get; set; }
}
