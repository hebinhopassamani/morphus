using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class UserStatusReflectedDto<TDto> : MorphusDto<UserStatus, TDto>
    where TDto : UserStatusReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<UserStatus, TDto>> BaseProjection => us => new TDto
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

public class UserStatusReflectedDto : UserStatusReflectedDto<UserStatusReflectedDto>;

public class UserStatusDto : UserStatusReflectedDto<UserStatusDto>;
