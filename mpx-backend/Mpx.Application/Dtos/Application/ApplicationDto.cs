using System.Linq.Expressions;

using Mpx.Core.Interfaces;

namespace Mpx.Application.Dtos;

using Application = Mpx.Domain.Entities.Application;

public class ApplicationDto : ApplicationReflectedDto, IMpxProjection<Application, ApplicationDto>
{
  public static new ApplicationDto Projection => new();

  public CategoryReflectedDto? Category { get; set; }
  public ApplicationStatusReflectedDto? ApplicationStatus { get; set; }
  public List<ApplicationModuleDto>? ApplicationModules { get; set; }
  public List<ModuleReflectedDto>? Modules { get; set; }
  public List<MenuReflectedDto>? Menus { get; set; }

  public ApplicationDto WithCategory()
  {
    Include<ApplicationDto, CategoryReflectedDto?>(
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
    Include<ApplicationDto, ApplicationStatusReflectedDto?>(
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
    Include<ApplicationDto, List<ApplicationModuleDto>?>(
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
    Include<ApplicationDto, List<ModuleReflectedDto>?>(
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
    Include<ApplicationDto, List<MenuReflectedDto>?>(
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

  Expression<Func<Application, ApplicationDto>> IMpxProjection<Application, ApplicationDto>.BuildProjection() =>
      BuildProjectionFor<ApplicationDto>();

  public static implicit operator Expression<Func<Application, ApplicationDto>>(ApplicationDto dto) =>
      dto.BuildProjectionFor<ApplicationDto>();
}
