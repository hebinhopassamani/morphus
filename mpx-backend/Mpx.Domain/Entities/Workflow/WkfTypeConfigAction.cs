using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class WkfTypeConfigAction : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public required string Label { get; set; }
  public string ControlType { get; set; } = "Button";
  public string ExecuteWhen { get; set; } = "ButtonClick";
  public Guid CorporationId { get; set; }
  public Guid WorkflowTypeConfigId { get; set; }
  public Guid? NextWorkflowTypeConfigId { get; set; }
  public bool IsAutomatic { get; set; }
  public int? AutoExecuteAfterMinutes { get; set; }
  public bool AutoExecuteOnSlaBreach { get; set; }
  public bool RequiresOpinion { get; set; }
  public int? OpinionMinLength { get; set; }
  public bool AllowsAttachments { get; set; } = true;
  public bool RequiresAttachments { get; set; }
  public int? MinAttachments { get; set; }
  public int? MaxAttachments { get; set; }
  public int Order { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? CustomCss { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfTypeConfig? WorkflowTypeConfig { get; set; }
  public virtual WkfTypeConfig? NextWorkflowTypeConfig { get; set; }
  public virtual ICollection<WkfTypeConfigActionFileType> AllowedFileTypes { get; set; } = [];
  public virtual ICollection<WkfPermission> Permissions { get; set; } = [];
}
