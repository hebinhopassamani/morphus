using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class ApplicationModuleReflectedDto<TDto> : MorphusDto<ApplicationModule, TDto>
    where TDto : ApplicationModuleReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int Order { get; set; }
    public Guid ApplicationId { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<ApplicationModule, TDto>> BaseProjection => m => new TDto
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

public class ApplicationModuleReflectedDto : ApplicationModuleReflectedDto<ApplicationModuleReflectedDto>;

public class ApplicationModuleDto : ApplicationModuleReflectedDto<ApplicationModuleDto>
{
    public ApplicationReflectedDto? Application { get; set; }
    public List<ApplicationSubModuleReflectedDto>? ApplicationSubModules { get; set; }

    public ApplicationModuleDto WithApplication()
    {
        Include(
            dto => dto.Application,
            m => m.Application == null
                ? null
                : new ApplicationReflectedDto
                {
                    Id = m.Application.Id,
                    Key = m.Application.Key,
                    System = m.Application.System,
                    Inactive = m.Application.Inactive,
                    CorporationId = m.Application.CorporationId,
                    CategoryId = m.Application.CategoryId,
                    ApplicationStatusId = m.Application.ApplicationStatusId,
                    Name = m.Application.Name,
                    Description = m.Application.Description,
                    Icon = m.Application.Icon,
                    Color = m.Application.Color
                });

        return this;
    }

    public ApplicationModuleDto WithApplicationSubModules()
    {
        Include(
            dto => dto.ApplicationSubModules,
            m => m.ApplicationSubModules
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
                .ToList());

        return this;
    }
}
