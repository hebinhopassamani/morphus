using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class SubModuleReflectedDto : MpxDto<SubModule, SubModuleReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public Guid ModuleId { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<SubModule, SubModuleReflectedDto>> BaseProjection => sm => new SubModuleReflectedDto
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
