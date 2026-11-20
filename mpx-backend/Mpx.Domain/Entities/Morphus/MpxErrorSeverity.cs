using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class MpxErrorSeverity : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public MpxErrorSeverityEnum Code { get; set; } = MpxErrorSeverityEnum.Low;
  public required string Label { get; set; }
  public bool InvolvesEntireWorkspace { get; set; }
  public bool InvolvesEntireCorporation { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxErrorCode> ErrorCodes { get; set; } = [];
}
