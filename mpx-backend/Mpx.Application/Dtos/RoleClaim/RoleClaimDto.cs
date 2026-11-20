using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

public class RoleClaimDto : MpxRelatedDto
{
  public Guid RoleId { get; set; }
  public Guid ClaimId { get; set; }
  public RoleReflectedDto? Role { get; set; }
  public ClaimReflectedDto? Claim { get; set; }
}
