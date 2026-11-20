using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class CategoryDto : CategoryReflectedDto, IMpxProjection<Category, CategoryDto>
{
  public static new CategoryDto Projection => new();

  Expression<Func<Category, CategoryDto>> IMpxProjection<Category, CategoryDto>.BuildProjection() =>
      BuildProjectionFor<CategoryDto>();

  public static implicit operator Expression<Func<Category, CategoryDto>>(CategoryDto dto) =>
      dto.BuildProjectionFor<CategoryDto>();
}
