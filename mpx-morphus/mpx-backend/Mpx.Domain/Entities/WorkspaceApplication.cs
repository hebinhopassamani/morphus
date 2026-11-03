namespace Mpx.Domain.Entities;

public class WorkspaceApplication : MorphusRelatedEntity
{
  public Guid WorkspaceId { get; set; }
  public Guid ApplicationId { get; set; }

  public virtual Workspace? Workspace { get; set; }
  public virtual MorphusApplication? Application { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
