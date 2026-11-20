using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class SubModuleDto : SubModuleReflectedDto, IMpxProjection<SubModule, SubModuleDto>
{
  public static new SubModuleDto Projection => new();

  public ModuleReflectedDto? Module { get; set; }
  public List<RoleReflectedDto>? Roles { get; set; }
  public List<ClaimReflectedDto>? Claims { get; set; }

  public SubModuleDto WithModule()
  {
    Include<SubModuleDto, ModuleReflectedDto?>(
        dto => dto.Module,
        sm => sm.Module == null
            ? null
            : new ModuleReflectedDto
            {
              Id = sm.Module.Id,
              Key = sm.Module.Key,
              System = sm.Module.System,
              Inactive = sm.Module.Inactive,
              CorporationId = sm.Module.CorporationId,
              ApplicationId = sm.Module.ApplicationId,
              Name = sm.Module.Name,
              Description = sm.Module.Description
            });

    return this;
  }

  public SubModuleDto WithRoles()
  {
    Include<SubModuleDto, List<RoleReflectedDto>?>(
        dto => dto.Roles,
        sm => sm.Roles
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

  public SubModuleDto WithClaims()
  {
    Include<SubModuleDto, List<ClaimReflectedDto>?>(
        dto => dto.Claims,
        sm => sm.Claims
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

  Expression<Func<SubModule, SubModuleDto>> IMpxProjection<SubModule, SubModuleDto>.BuildProjection() =>
      BuildProjectionFor<SubModuleDto>();

  public static implicit operator Expression<Func<SubModule, SubModuleDto>>(SubModuleDto dto) =>
      dto.BuildProjectionFor<SubModuleDto>();
}
