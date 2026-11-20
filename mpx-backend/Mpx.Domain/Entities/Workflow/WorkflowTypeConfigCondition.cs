using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTypeConfigCondition : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public string ConditionType { get; set; } = "If";
  public Guid NextWorkflowTypeConfigId { get; set; }
  public Guid? ElseNextWorkflowTypeConfigId { get; set; }
  public bool OpenParenthesis { get; set; }
  public required string PropertyName { get; set; }
  public string DataType { get; set; } = "text";
  public required string Operator { get; set; }
  public string? Value { get; set; }
  public bool CloseParenthesis { get; set; }
  public string? AndOr { get; set; }
  public string? WhereClause { get; set; }
  public string? CollectionPropertyName { get; set; }
  public int? MaxIterations { get; set; }
  public string? MergeMode { get; set; }
  public int? PollIntervalSeconds { get; set; }
  public int? TimeoutMinutes { get; set; }
  public int? MaxRetries { get; set; }
  public int? RetryIntervalSeconds { get; set; }
  public bool SplitIntoChildWorkflows { get; set; }
  public bool WaitChildWorkflowsComplete { get; set; }
  public bool IsCriticalCheck { get; set; }
  public bool HoldTargetInactive { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfig? NextWorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfig? ElseNextWorkflowTypeConfig { get; set; }
}
