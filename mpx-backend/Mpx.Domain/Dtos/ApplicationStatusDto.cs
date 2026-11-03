using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class ApplicationStatusReflectedDto<TDto> : MorphusDto<ApplicationStatus, TDto>
    where TDto : ApplicationStatusReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<ApplicationStatus, TDto>> BaseProjection => s => new TDto
    {
        Id = s.Id,
        Key = s.Key,
        System = s.System,
        Inactive = s.Inactive,
        CorporationId = s.CorporationId,
        Name = s.Name,
        Label = s.Label,
        Color = s.Color,
        Description = s.Description
    };
}

public class ApplicationStatusReflectedDto : ApplicationStatusReflectedDto<ApplicationStatusReflectedDto>;

public class ApplicationStatusDto : ApplicationStatusReflectedDto<ApplicationStatusDto>;
