using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ModuleReflectedDto : MpxDto<Module, ModuleReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public Guid ApplicationId { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<Module, ModuleReflectedDto>> BaseProjection => m => new ModuleReflectedDto
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
