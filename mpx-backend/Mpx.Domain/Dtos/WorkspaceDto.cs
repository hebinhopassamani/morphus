using System.Linq.Expressions;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Dtos;

public class WorkspaceReflectedDto<TDto> : MorphusDto<Workspace, TDto>
    where TDto : WorkspaceReflectedDto<TDto>, new()
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool Default { get; set; }

    protected override Expression<Func<Workspace, TDto>> BaseProjection => w => new TDto
    {
        Id = w.Id,
        Key = w.Key,
        System = w.System,
        Inactive = w.Inactive,
        CorporationId = w.CorporationId,
        Name = w.Name,
        Description = w.Description,
        Icon = w.Icon,
        Color = w.Color,
        Default = w.Default
    };
}

public class WorkspaceReflectedDto : WorkspaceReflectedDto<WorkspaceReflectedDto>;

public class WorkspaceDto : WorkspaceReflectedDto<WorkspaceDto>
{
    public CorporationReflectedDto? Corporation { get; set; }
    public List<ApplicationReflectedDto>? Applications { get; set; }
    public List<WorkspaceApplicationDto>? WorkspaceApplications { get; set; }
    public List<WorkspaceUserDto>? WorkspaceUsers { get; set; }

    public WorkspaceDto WithCorporation()
    {
        Include(
            dto => dto.Corporation,
            w => w.Corporation == null
                ? null
                : new CorporationReflectedDto
                {
                    Id = w.Corporation.Id,
                    Key = w.Corporation.Key,
                    System = w.Corporation.System,
                    Inactive = w.Corporation.Inactive,
                    CorporationId = w.Corporation.CorporationId,
                    Name = w.Corporation.Name,
                    Email = w.Corporation.Email,
                    PersonType = w.Corporation.PersonType,
                    CpfCnpj = w.Corporation.CpfCnpj,
                    FullName = w.Corporation.FullName,
                    Icon = w.Corporation.Icon,
                    Description = w.Corporation.Description
                });

        return this;
    }

    public WorkspaceDto WithApplications()
    {
        Include(
            dto => dto.Applications,
            w => w.WorkspaceApplications
                .Where(wa => !wa.Inactive && wa.Application != null && !wa.Application.Inactive)
                .Select(wa => new ApplicationReflectedDto
                {
                    Id = wa.Application!.Id,
                    Key = wa.Application.Key,
                    System = wa.Application.System,
                    Inactive = wa.Application.Inactive,
                    CorporationId = wa.Application.CorporationId,
                    Name = wa.Application.Name,
                    Description = wa.Application.Description,
                    Icon = wa.Application.Icon
                })
                .ToList());

        return this;
    }

    public WorkspaceDto WithWorkspaceApplications()
    {
        Include(
            dto => dto.WorkspaceApplications,
            w => w.WorkspaceApplications
                .Select(wa => new WorkspaceApplicationDto
                {
                    CorporationId = wa.CorporationId,
                    WorkspaceId = wa.WorkspaceId,
                    ApplicationId = wa.ApplicationId,
                    System = wa.System,
                    Inactive = wa.Inactive,
                    Application = wa.Application == null
                        ? null
                        : new ApplicationReflectedDto
                        {
                            Id = wa.Application.Id,
                            Key = wa.Application.Key,
                            System = wa.Application.System,
                            Inactive = wa.Application.Inactive,
                            CorporationId = wa.Application.CorporationId,
                            Name = wa.Application.Name,
                            Description = wa.Application.Description,
                            Icon = wa.Application.Icon
                        }
                })
                .ToList());

        return this;
    }
}
