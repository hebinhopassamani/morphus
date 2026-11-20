using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class UserStatusDto : UserStatusReflectedDto, IMpxProjection<UserStatus, UserStatusDto>
{
  public static new UserStatusDto Projection => new();

  Expression<Func<UserStatus, UserStatusDto>> IMpxProjection<UserStatus, UserStatusDto>.BuildProjection() =>
      BuildProjectionFor<UserStatusDto>();

  public static implicit operator Expression<Func<UserStatus, UserStatusDto>>(UserStatusDto dto) =>
      dto.BuildProjectionFor<UserStatusDto>();
}
