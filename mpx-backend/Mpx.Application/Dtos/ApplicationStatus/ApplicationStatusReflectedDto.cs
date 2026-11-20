using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ApplicationStatusReflectedDto : MpxDto<ApplicationStatus, ApplicationStatusReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string Label { get; set; } = string.Empty;
  public string? Color { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<ApplicationStatus, ApplicationStatusReflectedDto>> BaseProjection => s => new ApplicationStatusReflectedDto
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
