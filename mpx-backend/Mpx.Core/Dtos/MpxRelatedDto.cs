namespace Mpx.Core.Dtos;

public abstract class MpxRelatedDto
{
  public Guid CorporationId { get; set; }
  public bool System { get; set; }
  public bool Inactive { get; set; }
}
