using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class SecUserClaim : MpxRelatedEntity
{
  public Guid UserId { get; set; }
  public Guid ClaimId { get; set; }

  public virtual SecUser? User { get; set; }
  public virtual SecClaim? Claim { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
}

