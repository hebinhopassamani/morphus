using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class RoleReflectedDto<TDto> : MorphusDto<Role, TDto>
    where TDto : RoleReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public Guid ModuleId { get; set; }
    public Guid SubModuleId { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<Role, TDto>> BaseProjection => r => new TDto
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
    };
}

public class RoleReflectedDto : RoleReflectedDto<RoleReflectedDto>;

public class RoleDto : RoleReflectedDto<RoleDto>
{
    public ModuleReflectedDto? Module { get; set; }
    public SubModuleReflectedDto? SubModule { get; set; }
    public List<ClaimReflectedDto>? Claims { get; set; }

    public RoleDto WithModule()
    {
        Include(
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
        Include(
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
        Include(
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
}
