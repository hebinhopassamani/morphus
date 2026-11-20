using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class EntityProperty : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid EntityDefinitionId { get; set; }
  public required string Name { get; set; }
  public string? ColumnName { get; set; }
  public required string Label { get; set; }
  public required string DataType { get; set; } = "Text";
  public string DefaultControlType { get; set; } = "Input";
  public Guid? TargetEntityDefinitionId { get; set; }
  public string? ForeignKeyPropertyName { get; set; }
  public bool IsPrimaryKey { get; set; }
  public bool IsForeignKey { get; set; }
  public bool IsRequired { get; set; }
  public int? MinLength { get; set; }
  public int? MaxLength { get; set; }
  public decimal? MinValue { get; set; }
  public decimal? MaxValue { get; set; }
  public string? DefaultMask { get; set; }
  public string? RegexPattern { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual EntityDefinition? EntityDefinition { get; set; }
  public virtual EntityDefinition? TargetEntityDefinition { get; set; }
}
