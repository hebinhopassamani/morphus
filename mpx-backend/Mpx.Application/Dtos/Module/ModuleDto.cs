using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ModuleDto : ModuleReflectedDto, IMpxProjection<Module, ModuleDto>
{
  public static new ModuleDto Projection => new();

  public ApplicationReflectedDto? Application { get; set; }
  public List<SubModuleReflectedDto>? SubModules { get; set; }
  public List<RoleReflectedDto>? Roles { get; set; }
  public List<ClaimReflectedDto>? Claims { get; set; }

  public ModuleDto WithApplication()
  {
    Include<ModuleDto, ApplicationReflectedDto?>(
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
              Name = m.Application.Name,
              Description = m.Application.Description,
              Icon = m.Application.Icon
            });

    return this;
  }

  public ModuleDto WithSubModules()
  {
    Include<ModuleDto, List<SubModuleReflectedDto>?>(
        dto => dto.SubModules,
        m => m.SubModules
            .Select(sm => new SubModuleReflectedDto
            {
              Id = sm.Id,
              Key = sm.Key,
              System = sm.System,
              Inactive = sm.Inactive,
              CorporationId = sm.CorporationId,
              ModuleId = sm.ModuleId,
              Name = sm.Name,
              Description = sm.Description
            })
            .ToList());

    return this;
  }

  public ModuleDto WithRoles()
  {
    Include<ModuleDto, List<RoleReflectedDto>?>(
        dto => dto.Roles,
        m => m.Roles
            .Select(r => new RoleReflectedDto
            {
              Id = r.Id,
              Key = r.Key,
              System = r.System,
              Inactive = r.Inactive,
              CorporationId = r.CorporationId,
              ModuleId = r.ModuleId,
              SubModuleId = r.SubModuleId,
              Name = r.Name,
              Description = r.Description
            })
            .ToList());

    return this;
  }

  public ModuleDto WithClaims()
  {
    Include<ModuleDto, List<ClaimReflectedDto>?>(
        dto => dto.Claims,
        m => m.Claims
            .Select(c => new ClaimReflectedDto
            {
              Id = c.Id,
              Key = c.Key,
              System = c.System,
              Inactive = c.Inactive,
              CorporationId = c.CorporationId,
              ModuleId = c.ModuleId,
              SubModuleId = c.SubModuleId,
              ClaimType = c.ClaimType,
              ClaimValue = c.ClaimValue,
              Description = c.Description
            })
            .ToList());

    return this;
  }

  Expression<Func<Module, ModuleDto>> IMpxProjection<Module, ModuleDto>.BuildProjection() =>
      BuildProjectionFor<ModuleDto>();

  public static implicit operator Expression<Func<Module, ModuleDto>>(ModuleDto dto) =>
      dto.BuildProjectionFor<ModuleDto>();
}
