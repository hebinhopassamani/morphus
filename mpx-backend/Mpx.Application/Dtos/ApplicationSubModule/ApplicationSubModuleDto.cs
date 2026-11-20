using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ApplicationSubModuleDto : ApplicationSubModuleReflectedDto, IMpxProjection<ApplicationSubModule, ApplicationSubModuleDto>
{
  public static new ApplicationSubModuleDto Projection => new();

  public ApplicationModuleReflectedDto? ApplicationModule { get; set; }

  public ApplicationSubModuleDto WithApplicationModule()
  {
    Include<ApplicationSubModuleDto, ApplicationModuleReflectedDto?>(
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

  Expression<Func<ApplicationSubModule, ApplicationSubModuleDto>> IMpxProjection<ApplicationSubModule, ApplicationSubModuleDto>.BuildProjection() =>
      BuildProjectionFor<ApplicationSubModuleDto>();

  public static implicit operator Expression<Func<ApplicationSubModule, ApplicationSubModuleDto>>(ApplicationSubModuleDto dto) =>
      dto.BuildProjectionFor<ApplicationSubModuleDto>();
}
