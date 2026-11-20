using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTypeConfigValidation : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public Guid? WorkflowTypeConfigActionId { get; set; }
  public string ValidationType { get; set; } = "FilterRule";
  public string? PresetValidatorKey { get; set; }
  public string? EntityName { get; set; }
  public string? EntityAlias { get; set; }
  public bool OpenParenthesis { get; set; }
  public required string PropertyName { get; set; }
  public string DataType { get; set; } = "text";
  public string? Operator { get; set; }
  public string? Value { get; set; }
  public bool CloseParenthesis { get; set; }
  public string? AndOr { get; set; }
  public string? WhereClause { get; set; }
  public string? RegexPattern { get; set; }
  public string Severity { get; set; } = "Error";
  public required string ErrorMessage { get; set; }
  public int Order { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfigAction? WorkflowTypeConfigAction { get; set; }
}
