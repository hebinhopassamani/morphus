using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxCorporationUser : MpxRelatedEntity
{
  public Guid UserId { get; set; }
  public bool IsOwner { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; } = false;

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual SecUser? User { get; set; }
}

