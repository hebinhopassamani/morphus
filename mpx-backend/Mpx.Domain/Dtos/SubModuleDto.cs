using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class SubModuleReflectedDto<TDto> : MorphusDto<SubModule, TDto>
    where TDto : SubModuleReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public Guid ModuleId { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<SubModule, TDto>> BaseProjection => sm => new TDto
    {
        Id = sm.Id,
        Key = sm.Key,
        System = sm.System,
        Inactive = sm.Inactive,
        CorporationId = sm.CorporationId,
        ModuleId = sm.ModuleId,
        Name = sm.Name,
        Description = sm.Description
    };
}

public class SubModuleReflectedDto : SubModuleReflectedDto<SubModuleReflectedDto>;

public class SubModuleDto : SubModuleReflectedDto<SubModuleDto>
{
    public ModuleReflectedDto? Module { get; set; }
    public List<RoleReflectedDto>? Roles { get; set; }
    public List<ClaimReflectedDto>? Claims { get; set; }

    public SubModuleDto WithModule()
    {
        Include(
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
        Include(
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
        Include(
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
}
