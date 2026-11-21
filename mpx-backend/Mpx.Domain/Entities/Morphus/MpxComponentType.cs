using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class MpxComponentType : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public MpxComponentTypeEnum Code { get; set; } = MpxComponentTypeEnum.MpxButton;
  public required string TagName { get; set; }
  public required string Name { get; set; }
  public required string Label { get; set; }
  public bool IsContainerWrapper { get; set; }
  public bool SupportsWorkflowAction { get; set; }
  public bool SupportsReflectedField { get; set; }
  public required string DefaultParametersJson { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxScreenComponent> ScreenComponents { get; set; } = [];
}
