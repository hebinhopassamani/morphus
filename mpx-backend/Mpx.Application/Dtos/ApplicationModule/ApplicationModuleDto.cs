using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ApplicationModuleDto : ApplicationModuleReflectedDto, IMpxProjection<ApplicationModule, ApplicationModuleDto>
{
  public static new ApplicationModuleDto Projection => new();

  public ApplicationReflectedDto? Application { get; set; }
  public List<ApplicationSubModuleReflectedDto>? ApplicationSubModules { get; set; }

  public ApplicationModuleDto WithApplication()
  {
    Include<ApplicationModuleDto, ApplicationReflectedDto?>(
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
    Include<ApplicationModuleDto, List<ApplicationSubModuleReflectedDto>?>(
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

  Expression<Func<ApplicationModule, ApplicationModuleDto>> IMpxProjection<ApplicationModule, ApplicationModuleDto>.BuildProjection() =>
      BuildProjectionFor<ApplicationModuleDto>();

  public static implicit operator Expression<Func<ApplicationModule, ApplicationModuleDto>>(ApplicationModuleDto dto) =>
      dto.BuildProjectionFor<ApplicationModuleDto>();
}
