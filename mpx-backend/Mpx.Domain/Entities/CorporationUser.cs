namespace Mpx.Domain.Entities;

public class CorporationUser : MorphusRelatedEntity
{
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; } = false;

  public virtual Corporation? Corporation { get; set; }
  public virtual User? User { get; set; }
}
