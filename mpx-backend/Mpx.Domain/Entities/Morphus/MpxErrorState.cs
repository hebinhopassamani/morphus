using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class MpxErrorState : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public MpxErrorStateEnum Code { get; set; } = MpxErrorStateEnum.Open;
  public required string Label { get; set; }
  public bool IsTerminal { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxError> Errors { get; set; } = [];
}
