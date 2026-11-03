using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class CategoryReflectedDto<TDto> : MorphusDto<Category, TDto>
    where TDto : CategoryReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<Category, TDto>> BaseProjection => c => new TDto
    {
        Id = c.Id,
        Key = c.Key,
        System = c.System,
        Inactive = c.Inactive,
        CorporationId = c.CorporationId,
        Name = c.Name,
        Label = c.Label,
        Color = c.Color,
        Description = c.Description
    };
}

public class CategoryReflectedDto : CategoryReflectedDto<CategoryReflectedDto>;

public class CategoryDto : CategoryReflectedDto<CategoryDto>;
