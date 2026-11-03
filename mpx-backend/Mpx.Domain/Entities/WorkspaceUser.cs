namespace Mpx.Domain.Entities;

public class WorkspaceUser : MorphusRelatedEntity
{
  public Guid WorkspaceId { get; set; }
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }

  public virtual Workspace? Workspace { get; set; }
  public virtual User? User { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
