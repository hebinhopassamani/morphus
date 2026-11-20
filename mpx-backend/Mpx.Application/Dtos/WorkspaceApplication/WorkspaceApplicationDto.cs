using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

public class WorkspaceApplicationDto : MpxRelatedDto
{
  public Guid WorkspaceId { get; set; }
  public Guid ApplicationId { get; set; }
  public WorkspaceReflectedDto? Workspace { get; set; }
  public ApplicationReflectedDto? Application { get; set; }
}
