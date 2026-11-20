using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class ApplicationUser : MpxRelatedEntity
{
  public Guid ApplicationId { get; set; }
  public Guid UserId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public bool IsOwner { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; } = false;

  public virtual Application? Application { get; set; }
  public virtual User? User { get; set; }
  public virtual Corporation? Corporation { get; set; }
}

