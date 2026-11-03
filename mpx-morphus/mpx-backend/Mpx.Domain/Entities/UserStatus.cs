using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class UserStatus : MorphusEntity, IMorphusTenant
{
  public required string Name { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<User> Users { get; set; } = [];
}
