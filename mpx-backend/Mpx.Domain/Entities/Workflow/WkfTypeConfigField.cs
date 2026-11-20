using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfTypeConfigField : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public Guid? WorkflowTypeContextId { get; set; }
  public Guid? EntityDefinitionId { get; set; }
  public Guid? EntityPropertyId { get; set; }
  public Guid? TargetEntityDefinitionId { get; set; }
  public bool IsEntityProperty { get; set; } = true;
  public string? EntityName { get; set; }
  public string? EntityAlias { get; set; }
  public bool IsCollection { get; set; }
  public string? PropertyName { get; set; }
  public string? PropertyPath { get; set; }
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

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WkfTypeContext? WorkflowTypeContext { get; set; }
  public virtual MpxEntityDefinition? EntityDefinition { get; set; }
  public virtual MpxEntityProperty? EntityProperty { get; set; }
  public virtual MpxEntityDefinition? TargetEntityDefinition { get; set; }
  public virtual ICollection<WkfPermission> Permissions { get; set; } = [];
}
