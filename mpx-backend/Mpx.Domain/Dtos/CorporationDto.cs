using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class CorporationReflectedDto<TDto> : MorphusDto<Corporation, TDto>
    where TDto : CorporationReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PersonType { get; set; } = "PJ";
    public string? CpfCnpj { get; set; }
    public string? FullName { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public string? Description { get; set; }

    protected override Expression<Func<Corporation, TDto>> BaseProjection => c => new TDto
    {
        Id = c.Id,
        Key = c.Key,
        System = c.System,
        Inactive = c.Inactive,
        CorporationId = c.CorporationId,
        Name = c.Name,
        Email = c.Email,
        PersonType = c.PersonType,
        CpfCnpj = c.CpfCnpj,
        FullName = c.FullName,
        Icon = c.Icon,
        Color = c.Color,
        Description = c.Description
    };
}

public class CorporationReflectedDto : CorporationReflectedDto<CorporationReflectedDto>;

public class CorporationDto : CorporationReflectedDto<CorporationDto>
{
    public CorporationReflectedDto? ParentCorporation { get; set; }
    public List<WorkspaceReflectedDto>? Workspaces { get; set; }
    public List<ApplicationReflectedDto>? Applications { get; set; }

    public CorporationDto WithParentCorporation()
    {
        Include(
            dto => dto.ParentCorporation,
            c => c.ParentCorporation == null
                ? null
                : new CorporationReflectedDto
                {
                    Id = c.ParentCorporation.Id,
                    Key = c.ParentCorporation.Key,
                    System = c.ParentCorporation.System,
                    Inactive = c.ParentCorporation.Inactive,
                    CorporationId = c.ParentCorporation.CorporationId,
                    Name = c.ParentCorporation.Name,
                    Email = c.ParentCorporation.Email,
                    PersonType = c.ParentCorporation.PersonType,
                    CpfCnpj = c.ParentCorporation.CpfCnpj,
                    FullName = c.ParentCorporation.FullName,
                    Icon = c.ParentCorporation.Icon,
                    Description = c.ParentCorporation.Description
                });

        return this;
    }

    public CorporationDto WithWorkspaces()
    {
        Include(
            dto => dto.Workspaces,
            c => c.Workspaces
                .Where(w => !w.Inactive)
                .Select(w => new WorkspaceReflectedDto
                {
                    Id = w.Id,
                    Key = w.Key,
                    System = w.System,
                    Inactive = w.Inactive,
                    CorporationId = w.CorporationId,
                    Name = w.Name,
                    Description = w.Description,
                    Icon = w.Icon,
                    Default = w.Default
                })
                .ToList());

        return this;
    }

    public CorporationDto WithApplications()
    {
        Include(
            dto => dto.Applications,
            c => c.Applications
                .Where(a => !a.Inactive)
                .Select(a => new ApplicationReflectedDto
                {
                    Id = a.Id,
                    Key = a.Key,
                    System = a.System,
                    Inactive = a.Inactive,
                    CorporationId = a.CorporationId,
                    Name = a.Name,
                    Description = a.Description,
                    Icon = a.Icon
                })
                .ToList());

        return this;
    }
}
