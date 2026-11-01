using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkspaceApplication : IMorphusTenant
{
  public Guid WorkspaceId { get; set; }
  public Guid ApplicationId { get; set; }
  public Guid CorporationId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }

  public virtual Workspace? Workspace { get; set; }
  public virtual MorphusApplication? Application { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
