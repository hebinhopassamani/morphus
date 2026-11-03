namespace Mpx.Domain.Entities;

public class UserRole : MorphusRelatedEntity
{
  public Guid UserId { get; set; }
  public Guid RoleId { get; set; }

  public virtual User? User { get; set; }
  public virtual Role? Role { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
