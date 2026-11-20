using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class MenuDto : MenuReflectedDto, IMpxProjection<Menu, MenuDto>
{
  public static new MenuDto Projection => new();

  public ApplicationReflectedDto? Application { get; set; }
  public ModuleReflectedDto? Module { get; set; }
  public SubModuleReflectedDto? SubModule { get; set; }
  public List<MenuReflectedDto>? SubMenus { get; set; }

  public MenuDto WithSubMenus()
  {
    Include<MenuDto, List<MenuReflectedDto>?>(
        dto => dto.SubMenus,
        m => m.SubMenus
            .Where(sm => !sm.Inactive)
            .OrderBy(sm => sm.Order)
            .Select(sm => new MenuReflectedDto
            {
              Id = sm.Id,
              Key = sm.Key,
              System = sm.System,
              Inactive = sm.Inactive,
              CorporationId = sm.CorporationId,
              ApplicationId = sm.ApplicationId,
              ModuleId = sm.ModuleId,
              SubModuleId = sm.SubModuleId,
              MenuId = sm.MenuId,
              Label = sm.Label,
              Order = sm.Order,
              Url = sm.Url,
              Icon = sm.Icon,
              Description = sm.Description
            })
            .ToList());

    return this;
  }

  Expression<Func<Menu, MenuDto>> IMpxProjection<Menu, MenuDto>.BuildProjection() =>
      BuildProjectionFor<MenuDto>();

  public static implicit operator Expression<Func<Menu, MenuDto>>(MenuDto dto) =>
      dto.BuildProjectionFor<MenuDto>();
}
