using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class ApplicationSubModuleReflectedDto<TDto> : MorphusDto<ApplicationSubModule, TDto>
    where TDto : ApplicationSubModuleReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int Order { get; set; }
    public Guid ApplicationModuleId { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<ApplicationSubModule, TDto>> BaseProjection => sm => new TDto
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

public class ApplicationSubModuleReflectedDto : ApplicationSubModuleReflectedDto<ApplicationSubModuleReflectedDto>;

public class ApplicationSubModuleDto : ApplicationSubModuleReflectedDto<ApplicationSubModuleDto>
{
    public ApplicationModuleReflectedDto? ApplicationModule { get; set; }

    public ApplicationSubModuleDto WithApplicationModule()
    {
        Include(
            dto => dto.ApplicationModule,
            sm => sm.ApplicationModule == null
                ? null
                : new ApplicationModuleReflectedDto
                {
                    Id = sm.ApplicationModule.Id,
                    Key = sm.ApplicationModule.Key,
                    System = sm.ApplicationModule.System,
                    Inactive = sm.ApplicationModule.Inactive,
                    CorporationId = sm.ApplicationModule.CorporationId,
                    ApplicationId = sm.ApplicationModule.ApplicationId,
                    Name = sm.ApplicationModule.Name,
                    Label = sm.ApplicationModule.Label,
                    Icon = sm.ApplicationModule.Icon,
                    Color = sm.ApplicationModule.Color,
                    Order = sm.ApplicationModule.Order,
                    Description = sm.ApplicationModule.Description
                });

        return this;
    }
}
