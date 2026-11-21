using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxScreenComponent : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid ComponentTypeId { get; set; }
  public Guid? RouteId { get; set; }
  public Guid? WorkflowTypeId { get; set; }
  public Guid? StationId { get; set; }
  public Guid? WorkflowConfigId { get; set; }
  public Guid? WorkflowActionId { get; set; }
  public Guid? EntityPropertyId { get; set; }
  public Guid? ParentComponentId { get; set; }
  public required string ComponentCode { get; set; }
  public required string Label { get; set; }
  public required string TriggerEvent { get; set; }
  public required string EmbeddedConfigJson { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxComponentType? ComponentType { get; set; }
  public virtual MpxRoute? Route { get; set; }
  public virtual WkfType? WorkflowType { get; set; }
  public virtual WkfStation? Station { get; set; }
  public virtual WkfTypeConfig? WorkflowConfig { get; set; }
  public virtual WkfTypeConfigAction? WorkflowAction { get; set; }
  public virtual MpxEntityProperty? EntityProperty { get; set; }
  public virtual MpxScreenComponent? ParentComponent { get; set; }
  public virtual ICollection<MpxScreenComponent> ChildComponents { get; set; } = [];
}
