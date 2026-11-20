using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class MenuReflectedDto : MpxDto<Menu, MenuReflectedDto>
{
  public string Label { get; set; } = string.Empty;
  public Guid ApplicationId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public Guid? MenuId { get; set; }
  public int Order { get; set; }
  public string? Url { get; set; }
  public string? Icon { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<Menu, MenuReflectedDto>> BaseProjection => m => new MenuReflectedDto
  {
    Id = m.Id,
    Key = m.Key,
    System = m.System,
    Inactive = m.Inactive,
    CorporationId = m.CorporationId,
    ApplicationId = m.ApplicationId,
    ModuleId = m.ModuleId,
    SubModuleId = m.SubModuleId,
    MenuId = m.MenuId,
    Label = m.Label,
    Order = m.Order,
    Url = m.Url,
    Icon = m.Icon,
    Description = m.Description
  };
}
