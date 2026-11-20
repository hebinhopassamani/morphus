using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class UserStatusReflectedDto : MpxDto<UserStatus, UserStatusReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string Label { get; set; } = string.Empty;
  public string? Color { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<UserStatus, UserStatusReflectedDto>> BaseProjection => us => new UserStatusReflectedDto
  {
    Id = us.Id,
    Key = us.Key,
    System = us.System,
    Inactive = us.Inactive,
    CorporationId = us.CorporationId,
    Name = us.Name,
    Label = us.Label,
    Color = us.Color,
    Description = us.Description
  };
}
