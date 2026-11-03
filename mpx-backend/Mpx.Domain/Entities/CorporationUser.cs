namespace Mpx.Domain.Entities;

public class CorporationUser : MorphusRelatedEntity
{
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual User? User { get; set; }
}
