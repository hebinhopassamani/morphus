using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class EntityDefinition : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid? ApplicationId { get; set; }
  public required string Name { get; set; }
  public required string TableName { get; set; }
  public required string Label { get; set; }
  public string? PluralLabel { get; set; }
  public string ModuleName { get; set; } = "Morphus";
  public string? Icon { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual Application? Application { get; set; }
  public virtual ICollection<EntityProperty> Properties { get; set; } = [];
  public virtual ICollection<EntityProperty> TargetedByProperties { get; set; } = [];
  public virtual ICollection<WorkflowTypeContext> WorkflowContexts { get; set; } = [];
}
