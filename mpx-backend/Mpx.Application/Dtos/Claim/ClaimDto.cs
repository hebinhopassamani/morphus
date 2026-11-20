using System.Linq.Expressions;

using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ClaimDto : ClaimReflectedDto, IMpxProjection<Claim, ClaimDto>
{
  public static new ClaimDto Projection => new();

  public ModuleReflectedDto? Module { get; set; }
  public SubModuleReflectedDto? SubModule { get; set; }

  public ClaimDto WithModule()
  {
    Include<ClaimDto, ModuleReflectedDto?>(
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
    Include<ClaimDto, SubModuleReflectedDto?>(
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

  Expression<Func<Claim, ClaimDto>> IMpxProjection<Claim, ClaimDto>.BuildProjection() =>
      BuildProjectionFor<ClaimDto>();

  public static implicit operator Expression<Func<Claim, ClaimDto>>(ClaimDto dto) =>
      dto.BuildProjectionFor<ClaimDto>();
}
