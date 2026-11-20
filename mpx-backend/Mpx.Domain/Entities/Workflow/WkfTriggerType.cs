using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class WkfTriggerType : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public WkfTriggerTypeEnum Code { get; set; } = WkfTriggerTypeEnum.HtmlAction;
  public required string Name { get; set; }
  public required string Label { get; set; }
  public bool RequiresRoute { get; set; }
  public bool RequiresSchedule { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<WkfType> WorkflowTypes { get; set; } = [];
}
