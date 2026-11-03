namespace Mpx.Domain.Entities;

public class ApplicationUser : MorphusRelatedEntity
{
  public Guid ApplicationId { get; set; }
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }

  public virtual MorphusApplication? Application { get; set; }
  public virtual User? User { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
