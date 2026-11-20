using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class RoleReflectedDto : MpxDto<Role, RoleReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string? Email { get; set; }
  public Guid ModuleId { get; set; }
  public Guid SubModuleId { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<Role, RoleReflectedDto>> BaseProjection => r => new RoleReflectedDto
  {
    Id = r.Id,
    Key = r.Key,
    System = r.System,
    Inactive = r.Inactive,
    CorporationId = r.CorporationId,
    ModuleId = r.ModuleId,
    SubModuleId = r.SubModuleId,
    Name = r.Name,
    Email = r.Email,
    Description = r.Description
  };
}
