using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfTypeContext : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeId { get; set; }
  public Guid? AddedInConfigId { get; set; }
  public Guid EntityDefinitionId { get; set; }
  public required string Alias { get; set; }
  public bool IsRootEntity { get; set; }
  public bool IsCollection { get; set; }
  public bool IsAutoIncluded { get; set; }
  public Guid? ParentContextId { get; set; }
  public Guid? ForeignKeyPropertyId { get; set; }
  public string? RelationshipPath { get; set; }
  public bool HasUnlinkedWarning { get; set; }
  public double PositionX { get; set; }
  public double PositionY { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfType? WorkflowType { get; set; }
  public virtual WkfTypeConfig? AddedInConfig { get; set; }
  public virtual MpxEntityDefinition? EntityDefinition { get; set; }
  public virtual WkfTypeContext? ParentContext { get; set; }
  public virtual MpxEntityProperty? ForeignKeyProperty { get; set; }
  public virtual ICollection<WkfTypeContext> ChildContexts { get; set; } = [];
  public virtual ICollection<WkfTypeConfigField> Fields { get; set; } = [];
  public virtual ICollection<WkfItem> Items { get; set; } = [];
}
