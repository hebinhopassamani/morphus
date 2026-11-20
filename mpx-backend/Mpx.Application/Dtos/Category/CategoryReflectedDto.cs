using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class CategoryReflectedDto : MpxDto<Category, CategoryReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string Label { get; set; } = string.Empty;
  public string? Color { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<Category, CategoryReflectedDto>> BaseProjection => c => new CategoryReflectedDto
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
