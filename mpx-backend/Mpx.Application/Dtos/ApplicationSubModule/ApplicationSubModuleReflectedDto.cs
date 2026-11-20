using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ApplicationSubModuleReflectedDto : MpxDto<ApplicationSubModule, ApplicationSubModuleReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string Label { get; set; } = string.Empty;
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public Guid ApplicationModuleId { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<ApplicationSubModule, ApplicationSubModuleReflectedDto>> BaseProjection => sm => new ApplicationSubModuleReflectedDto
  {
    Id = sm.Id,
    Key = sm.Key,
    System = sm.System,
    Inactive = sm.Inactive,
    CorporationId = sm.CorporationId,
    ApplicationModuleId = sm.ApplicationModuleId,
    Name = sm.Name,
    Label = sm.Label,
    Icon = sm.Icon,
    Color = sm.Color,
    Order = sm.Order,
    Description = sm.Description
  };
}
