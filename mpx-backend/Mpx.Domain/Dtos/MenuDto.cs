using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class MenuReflectedDto<TDto> : MorphusDto<Menu, TDto>
    where TDto : MenuReflectedDto<TDto>, new()
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

    protected override Expression<Func<Menu, TDto>> BaseProjection => m => new TDto
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

public class MenuReflectedDto : MenuReflectedDto<MenuReflectedDto>;

public class MenuDto : MenuReflectedDto<MenuDto>
{
    public ApplicationReflectedDto? Application { get; set; }
    public ModuleReflectedDto? Module { get; set; }
    public SubModuleReflectedDto? SubModule { get; set; }
    public List<MenuReflectedDto>? SubMenus { get; set; }

    public MenuDto WithSubMenus()
    {
        Include(
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
}
