using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfItem : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowId { get; set; }
  public Guid? ParentWorkflowItemId { get; set; }
  public Guid? WorkflowTypeContextId { get; set; }
  public Guid? EntityDefinitionId { get; set; }
  public Guid? AddedInConfigId { get; set; }
  public Guid? WorkflowTypeConfigFieldId { get; set; }
  public Guid? AddedByUserId { get; set; }
  public string ItemType { get; set; } = "Entity";
  public bool IsPrimaryEntity { get; set; }
  public string? EntityName { get; set; }
  public string? EntityAlias { get; set; }
  public Guid? EntityId { get; set; }
  public string? FileName { get; set; }
  public string? MimeType { get; set; }
  public long? FileSize { get; set; }
  public string? StorageUrl { get; set; }
  public string? PayloadJson { get; set; }
  public bool PendingActivation { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfWorkflow? Workflow { get; set; }
  public virtual WkfItem? ParentWorkflowItem { get; set; }
  public virtual WkfTypeContext? WorkflowTypeContext { get; set; }
  public virtual MpxEntityDefinition? EntityDefinition { get; set; }
  public virtual WkfTypeConfig? AddedInConfig { get; set; }
  public virtual WkfTypeConfigField? WorkflowTypeConfigField { get; set; }
  public virtual SecUser? AddedByUser { get; set; }
  public virtual ICollection<WkfItem> ChildItems { get; set; } = [];
  public virtual ICollection<WkfItemMetadata> Metadatas { get; set; } = [];
}
