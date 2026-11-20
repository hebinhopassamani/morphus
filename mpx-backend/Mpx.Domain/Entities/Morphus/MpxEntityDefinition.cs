using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxEntityDefinition : MpxEntity
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

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxApplication? Application { get; set; }
  public virtual ICollection<MpxEntityProperty> Properties { get; set; } = [];
  public virtual ICollection<MpxEntityProperty> TargetedByProperties { get; set; } = [];
  public virtual ICollection<WkfTypeContext> WorkflowContexts { get; set; } = [];
}
