using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkflowItemMetadata : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid WorkflowItemId { get; set; }
  public Guid? WorkflowTypeConfigId { get; set; }
  public Guid? WorkflowTypeConfigFieldId { get; set; }
  public required string MetadataKey { get; set; }
  public string? Value { get; set; }
  public string DataType { get; set; } = "text";
  public string? Tag { get; set; }
  public bool IsCritical { get; set; }
  public Guid? RequiredClaimId { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowItem? WorkflowItem { get; set; }
  public virtual WorkflowTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WorkflowTypeConfigField? WorkflowTypeConfigField { get; set; }
  public virtual Claim? RequiredClaim { get; set; }
}
