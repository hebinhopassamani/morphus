using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ApplicationModuleReflectedDto : MpxDto<ApplicationModule, ApplicationModuleReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string Label { get; set; } = string.Empty;
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public Guid ApplicationId { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<ApplicationModule, ApplicationModuleReflectedDto>> BaseProjection => m => new ApplicationModuleReflectedDto
  {
    Id = m.Id,
    Key = m.Key,
    System = m.System,
    Inactive = m.Inactive,
    CorporationId = m.CorporationId,
    ApplicationId = m.ApplicationId,
    Name = m.Name,
    Label = m.Label,
    Icon = m.Icon,
    Color = m.Color,
    Order = m.Order,
    Description = m.Description
  };
}
