using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

public class UserClaimDto : MpxRelatedDto
{
  public Guid UserId { get; set; }
  public Guid ClaimId { get; set; }
  public UserReflectedDto? User { get; set; }
  public ClaimReflectedDto? Claim { get; set; }
}
