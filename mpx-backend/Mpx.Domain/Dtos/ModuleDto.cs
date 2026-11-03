using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class ModuleReflectedDto<TDto> : MorphusDto<Module, TDto>
    where TDto : ModuleReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public Guid ApplicationId { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<Module, TDto>> BaseProjection => m => new TDto
    {
        Id = m.Id,
        Key = m.Key,
        System = m.System,
        Inactive = m.Inactive,
        CorporationId = m.CorporationId,
        ApplicationId = m.ApplicationId,
        Name = m.Name,
        Description = m.Description
    };
}

public class ModuleReflectedDto : ModuleReflectedDto<ModuleReflectedDto>;

public class ModuleDto : ModuleReflectedDto<ModuleDto>
{
    public ApplicationReflectedDto? Application { get; set; }
    public List<SubModuleReflectedDto>? SubModules { get; set; }
    public List<RoleReflectedDto>? Roles { get; set; }
    public List<ClaimReflectedDto>? Claims { get; set; }

    public ModuleDto WithApplication()
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
                    Name = m.Application.Name,
                    Description = m.Application.Description,
                    Icon = m.Application.Icon
                });

        return this;
    }

    public ModuleDto WithSubModules()
    {
        Include(
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
        Include(
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
        Include(
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
}
