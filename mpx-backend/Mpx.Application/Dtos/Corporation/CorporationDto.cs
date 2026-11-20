using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class CorporationDto : CorporationReflectedDto, IMpxProjection<Corporation, CorporationDto>
{
  public static new CorporationDto Projection => new();

  public CorporationReflectedDto? ParentCorporation { get; set; }
  public List<WorkspaceReflectedDto>? Workspaces { get; set; }
  public List<ApplicationReflectedDto>? Applications { get; set; }

  public CorporationDto WithParentCorporation()
  {
    Include<CorporationDto, CorporationReflectedDto?>(
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
    Include<CorporationDto, List<WorkspaceReflectedDto>?>(
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
    Include<CorporationDto, List<ApplicationReflectedDto>?>(
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

  Expression<Func<Corporation, CorporationDto>> IMpxProjection<Corporation, CorporationDto>.BuildProjection() =>
      BuildProjectionFor<CorporationDto>();

  public static implicit operator Expression<Func<Corporation, CorporationDto>>(CorporationDto dto) =>
      dto.BuildProjectionFor<CorporationDto>();
}
