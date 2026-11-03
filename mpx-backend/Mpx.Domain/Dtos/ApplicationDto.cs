using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class ApplicationReflectedDto<TDto> : MorphusDto<MorphusApplication, TDto>
    where TDto : ApplicationReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? ApplicationStatusId { get; set; }

    protected override Expression<Func<MorphusApplication, TDto>> BaseProjection => a => new TDto
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

public class ApplicationReflectedDto : ApplicationReflectedDto<ApplicationReflectedDto>;

public class ApplicationDto : ApplicationReflectedDto<ApplicationDto>
{
    public CategoryReflectedDto? Category { get; set; }
    public ApplicationStatusReflectedDto? ApplicationStatus { get; set; }
    public List<ApplicationModuleDto>? ApplicationModules { get; set; }
    public List<ModuleReflectedDto>? Modules { get; set; }
    public List<MenuReflectedDto>? Menus { get; set; }

    public ApplicationDto WithCategory()
    {
        Include(
            dto => dto.Category,
            a => a.Category == null
                ? null
                : new CategoryReflectedDto
                {
                    Id = a.Category.Id,
                    Key = a.Category.Key,
                    System = a.Category.System,
                    Inactive = a.Category.Inactive,
                    CorporationId = a.Category.CorporationId,
                    Name = a.Category.Name,
                    Label = a.Category.Label,
                    Color = a.Category.Color,
                    Description = a.Category.Description
                });

        return this;
    }

    public ApplicationDto WithApplicationStatus()
    {
        Include(
            dto => dto.ApplicationStatus,
            a => a.ApplicationStatus == null
                ? null
                : new ApplicationStatusReflectedDto
                {
                    Id = a.ApplicationStatus.Id,
                    Key = a.ApplicationStatus.Key,
                    System = a.ApplicationStatus.System,
                    Inactive = a.ApplicationStatus.Inactive,
                    CorporationId = a.ApplicationStatus.CorporationId,
                    Name = a.ApplicationStatus.Name,
                    Label = a.ApplicationStatus.Label,
                    Color = a.ApplicationStatus.Color,
                    Description = a.ApplicationStatus.Description
                });

        return this;
    }

    public ApplicationDto WithApplicationModules()
    {
        Include(
            dto => dto.ApplicationModules,
            a => a.ApplicationModules
                .Where(m => !m.Inactive)
                .OrderBy(m => m.Order)
                .Select(m => new ApplicationModuleDto
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
                    Description = m.Description,
                    ApplicationSubModules = m.ApplicationSubModules
                        .Where(sm => !sm.Inactive)
                        .OrderBy(sm => sm.Order)
                        .Select(sm => new ApplicationSubModuleReflectedDto
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
                        })
                        .ToList()
                })
                .ToList());

        return this;
    }

    public ApplicationDto WithModules()
    {
        Include(
            dto => dto.Modules,
            a => a.Modules
                .Where(m => !m.Inactive)
                .Select(m => new ModuleReflectedDto
                {
                    Id = m.Id,
                    Key = m.Key,
                    System = m.System,
                    Inactive = m.Inactive,
                    CorporationId = m.CorporationId,
                    ApplicationId = m.ApplicationId,
                    Name = m.Name,
                    Description = m.Description
                })
                .ToList());

        return this;
    }

    public ApplicationDto WithMenus()
    {
        Include(
            dto => dto.Menus,
            a => a.Menus
                .Where(m => !m.Inactive)
                .OrderBy(m => m.Order)
                .Select(m => new MenuReflectedDto
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
                })
                .ToList());

        return this;
    }
}
