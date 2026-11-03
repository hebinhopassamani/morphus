using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class ClaimReflectedDto<TDto> : MorphusDto<Claim, TDto>
    where TDto : ClaimReflectedDto<TDto>, new()
{
    public string ClaimType { get; set; } = string.Empty;
    public string ClaimValue { get; set; } = string.Empty;
    public Guid ModuleId { get; set; }
    public Guid SubModuleId { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<Claim, TDto>> BaseProjection => c => new TDto
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
    };
}

public class ClaimReflectedDto : ClaimReflectedDto<ClaimReflectedDto>;

public class ClaimDto : ClaimReflectedDto<ClaimDto>
{
    public ModuleReflectedDto? Module { get; set; }
    public SubModuleReflectedDto? SubModule { get; set; }

    public ClaimDto WithModule()
    {
        Include(
            dto => dto.Module,
            c => c.Module == null
                ? null
                : new ModuleReflectedDto
                {
                    Id = c.Module.Id,
                    Key = c.Module.Key,
                    System = c.Module.System,
                    Inactive = c.Module.Inactive,
                    CorporationId = c.Module.CorporationId,
                    ApplicationId = c.Module.ApplicationId,
                    Name = c.Module.Name,
                    Description = c.Module.Description
                });

        return this;
    }

    public ClaimDto WithSubModule()
    {
        Include(
            dto => dto.SubModule,
            c => c.SubModule == null
                ? null
                : new SubModuleReflectedDto
                {
                    Id = c.SubModule.Id,
                    Key = c.SubModule.Key,
                    System = c.SubModule.System,
                    Inactive = c.SubModule.Inactive,
                    CorporationId = c.SubModule.CorporationId,
                    ModuleId = c.SubModule.ModuleId,
                    Name = c.SubModule.Name,
                    Description = c.SubModule.Description
                });

        return this;
    }
}
