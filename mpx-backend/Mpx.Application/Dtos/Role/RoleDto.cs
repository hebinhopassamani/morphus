using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class RoleDto : RoleReflectedDto, IMpxProjection<Role, RoleDto>
{
  public static new RoleDto Projection => new();

  public ModuleReflectedDto? Module { get; set; }
  public SubModuleReflectedDto? SubModule { get; set; }
  public List<ClaimReflectedDto>? Claims { get; set; }

  public RoleDto WithModule()
  {
    Include<RoleDto, ModuleReflectedDto?>(
        dto => dto.Module,
        r => r.Module == null
            ? null
            : new ModuleReflectedDto
            {
              Id = r.Module.Id,
              Key = r.Module.Key,
              System = r.Module.System,
              Inactive = r.Module.Inactive,
              CorporationId = r.Module.CorporationId,
              ApplicationId = r.Module.ApplicationId,
              Name = r.Module.Name,
              Description = r.Module.Description
            });

    return this;
  }

  public RoleDto WithSubModule()
  {
    Include<RoleDto, SubModuleReflectedDto?>(
        dto => dto.SubModule,
        r => r.SubModule == null
            ? null
            : new SubModuleReflectedDto
            {
              Id = r.SubModule.Id,
              Key = r.SubModule.Key,
              System = r.SubModule.System,
              Inactive = r.SubModule.Inactive,
              CorporationId = r.SubModule.CorporationId,
              ModuleId = r.SubModule.ModuleId,
              Name = r.SubModule.Name,
              Description = r.SubModule.Description
            });

    return this;
  }

  public RoleDto WithClaims()
  {
    Include<RoleDto, List<ClaimReflectedDto>?>(
        dto => dto.Claims,
        r => r.RoleClaims
            .Where(rc => !rc.Inactive && rc.Claim != null && !rc.Claim.Inactive)
            .Select(rc => new ClaimReflectedDto
            {
              Id = rc.Claim!.Id,
              Key = rc.Claim.Key,
              System = rc.Claim.System,
              Inactive = rc.Claim.Inactive,
              CorporationId = rc.Claim.CorporationId,
              ModuleId = rc.Claim.ModuleId,
              SubModuleId = rc.Claim.SubModuleId,
              ClaimType = rc.Claim.ClaimType,
              ClaimValue = rc.Claim.ClaimValue,
              Description = rc.Claim.Description
            })
            .ToList());

    return this;
  }

  Expression<Func<Role, RoleDto>> IMpxProjection<Role, RoleDto>.BuildProjection() =>
      BuildProjectionFor<RoleDto>();

  public static implicit operator Expression<Func<Role, RoleDto>>(RoleDto dto) =>
      dto.BuildProjectionFor<RoleDto>();
}
