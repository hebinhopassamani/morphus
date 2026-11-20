using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxApplicationUser : MpxRelatedEntity
{
  public Guid ApplicationId { get; set; }
  public Guid UserId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public bool IsOwner { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; } = false;

  public virtual MpxApplication? Application { get; set; }
  public virtual SecUser? User { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
}

