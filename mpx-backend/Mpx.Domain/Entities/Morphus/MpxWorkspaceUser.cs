using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxWorkspaceUser : MpxRelatedEntity
{
  public Guid WorkspaceId { get; set; }
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; } = false;

  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual SecUser? User { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
}

