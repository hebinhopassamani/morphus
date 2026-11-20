using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

public class UserRoleDto : MpxRelatedDto
{
  public Guid UserId { get; set; }
  public Guid RoleId { get; set; }
  public UserReflectedDto? User { get; set; }
  public RoleReflectedDto? Role { get; set; }
}
