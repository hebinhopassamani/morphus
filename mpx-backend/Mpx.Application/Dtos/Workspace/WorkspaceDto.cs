using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class WorkspaceDto : WorkspaceReflectedDto, IMpxProjection<Workspace, WorkspaceDto>
{
  public static new WorkspaceDto Projection => new();

  public CorporationReflectedDto? Corporation { get; set; }
  public List<ApplicationReflectedDto>? Applications { get; set; }
  public List<WorkspaceApplicationDto>? WorkspaceApplications { get; set; }
  public List<WorkspaceUserDto>? WorkspaceUsers { get; set; }

  public WorkspaceDto WithCorporation()
  {
    Include<WorkspaceDto, CorporationReflectedDto?>(
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
    Include<WorkspaceDto, List<ApplicationReflectedDto>?>(
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
    Include<WorkspaceDto, List<WorkspaceApplicationDto>?>(
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

  Expression<Func<Workspace, WorkspaceDto>> IMpxProjection<Workspace, WorkspaceDto>.BuildProjection() =>
      BuildProjectionFor<WorkspaceDto>();

  public static implicit operator Expression<Func<Workspace, WorkspaceDto>>(WorkspaceDto dto) =>
      dto.BuildProjectionFor<WorkspaceDto>();
}
