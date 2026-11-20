using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowTypeConfigField : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public bool IsEntityProperty { get; set; } = true;
  public string? EntityName { get; set; }
  public string? EntityAlias { get; set; }
  public bool IsCollection { get; set; }
  public required string PropertyName { get; set; }
  public required string Label { get; set; }
  public string? Placeholder { get; set; }
  public string DataType { get; set; } = "text";
  public string ControlType { get; set; } = "Input";
  public string? OptionsJson { get; set; }
  public string? Mask { get; set; }
  public string? DefaultValue { get; set; }
  public bool IsVisible { get; set; } = true;
  public bool IsEditable { get; set; }
  public bool IsRequired { get; set; }
  public int? MinLength { get; set; }
  public int? MaxLength { get; set; }
  public decimal? MinValue { get; set; }
  public decimal? MaxValue { get; set; }
  public string? RegexPattern { get; set; }
  public int GridSpan { get; set; } = 12;
  public int Order { get; set; }
  public string? CustomCss { get; set; }
  public string? HelpText { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual ICollection<WorkflowPermission> Permissions { get; set; } = [];
}
