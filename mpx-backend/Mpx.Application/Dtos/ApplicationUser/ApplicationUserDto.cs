using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

public class ApplicationUserDto : MpxRelatedDto
{
  public Guid ApplicationId { get; set; }
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }
  public ApplicationReflectedDto? Application { get; set; }
  public UserReflectedDto? User { get; set; }
}
