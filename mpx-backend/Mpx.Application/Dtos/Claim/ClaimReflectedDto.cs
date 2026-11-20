using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class ClaimReflectedDto : MpxDto<Claim, ClaimReflectedDto>
{
  public string ClaimType { get; set; } = string.Empty;
  public string ClaimValue { get; set; } = string.Empty;
  public Guid ModuleId { get; set; }
  public Guid SubModuleId { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<Claim, ClaimReflectedDto>> BaseProjection => c => new ClaimReflectedDto
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
