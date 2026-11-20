using System.Linq.Expressions;

using Mpx.Core.Dtos;

namespace Mpx.Application.Dtos;

using Application = Mpx.Domain.Entities.MpxApplication;

public class ApplicationReflectedDto : MpxDto<Application, ApplicationReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public Guid? CategoryId { get; set; }
  public Guid? ApplicationStatusId { get; set; }

  protected override Expression<Func<Application, ApplicationReflectedDto>> BaseProjection => a => new ApplicationReflectedDto
  {
    Id = a.Id,
    Key = a.Key,
    System = a.System,
    Inactive = a.Inactive,
    CorporationId = a.CorporationId,
    CategoryId = a.CategoryId,
    ApplicationStatusId = a.ApplicationStatusId,
    Name = a.Name,
    Description = a.Description,
    Icon = a.Icon,
    Color = a.Color
  };
}
