using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

public class WorkspaceUserDto : MpxRelatedDto
{
  public Guid WorkspaceId { get; set; }
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }
  public WorkspaceReflectedDto? Workspace { get; set; }
  public UserReflectedDto? User { get; set; }
}
