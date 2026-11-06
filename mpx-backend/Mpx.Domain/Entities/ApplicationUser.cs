namespace Mpx.Domain.Entities;

public class ApplicationUser : MorphusRelatedEntity
{
  public Guid ApplicationId { get; set; }
  public Guid UserId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public bool IsOwner { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; } = false;

  public virtual MorphusApplication? Application { get; set; }
  public virtual User? User { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
