using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowItem : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowId { get; set; }
  public Guid? ParentWorkflowItemId { get; set; }
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

  public virtual Corporation? Corporation { get; set; }
  public virtual Workflow? Workflow { get; set; }
  public virtual WorkflowItem? ParentWorkflowItem { get; set; }
  public virtual WorkflowTypeConfig? AddedInConfig { get; set; }
  public virtual WorkflowTypeConfigField? WorkflowTypeConfigField { get; set; }
  public virtual User? AddedByUser { get; set; }
  public virtual ICollection<WorkflowItem> ChildItems { get; set; } = [];
  public virtual ICollection<WorkflowItemMetadata> Metadatas { get; set; } = [];
}
