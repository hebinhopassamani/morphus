using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class SecUserRole : MpxRelatedEntity
{
  public Guid UserId { get; set; }
  public Guid RoleId { get; set; }

  public virtual SecUser? User { get; set; }
  public virtual SecRole? Role { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
}

