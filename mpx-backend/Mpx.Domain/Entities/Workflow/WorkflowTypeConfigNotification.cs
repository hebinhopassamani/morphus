using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTypeConfigNotification : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public Guid? WorkflowTypeConfigActionId { get; set; }
  public Guid? WorkflowTypeConfigSlaId { get; set; }
  public string TriggerEvent { get; set; } = "OnEnter";
  public Guid? TargetRoleId { get; set; }
  public Guid? TargetUserId { get; set; }
  public string? TargetEmail { get; set; }
  public string? EntityEmailPropertyPath { get; set; }
  public bool NotifyRoleEmail { get; set; }
  public bool NotifyRoleUsers { get; set; }
  public bool NotifyCorporationEmail { get; set; }
  public bool NotifyTaskOwners { get; set; }
  public bool NotifyWorkflowStarter { get; set; }
  public bool NotifyPreviousStepExecutor { get; set; }
  public Guid? CcRoleId { get; set; }
  public string? CcEmails { get; set; }
  public Guid? BccRoleId { get; set; }
  public Guid? BccUserId { get; set; }
  public string? BccEmails { get; set; }
  public bool AttachWorkflowFiles { get; set; }
  public string? AttachmentKeys { get; set; }
  public string? AttachmentTagFilter { get; set; }
  public Guid? AttachmentFromConfigId { get; set; }
  public string? AttachmentFilterWhereClause { get; set; }
  public int? RepeatIntervalMinutes { get; set; }
  public string Channel { get; set; } = "Both";
  public string? TemplateKey { get; set; }
  public string? SubjectTemplate { get; set; }
  public string? MessageTemplate { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfigAction? WorkflowTypeConfigAction { get; set; }
  public virtual WorkflowTypeConfigSla? WorkflowTypeConfigSla { get; set; }
  public virtual Role? TargetRole { get; set; }
  public virtual User? TargetUser { get; set; }
  public virtual Role? CcRole { get; set; }
  public virtual Role? BccRole { get; set; }
  public virtual User? BccUser { get; set; }
}
