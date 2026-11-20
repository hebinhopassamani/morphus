using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

public class CorporationUserDto : MpxRelatedDto
{
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }
  public CorporationReflectedDto? Corporation { get; set; }
  public UserReflectedDto? User { get; set; }
}
