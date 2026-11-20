using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class WorkspaceUser : MpxRelatedEntity
{
  public Guid WorkspaceId { get; set; }
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; } = false;

  public virtual Workspace? Workspace { get; set; }
  public virtual User? User { get; set; }
  public virtual Corporation? Corporation { get; set; }
}

