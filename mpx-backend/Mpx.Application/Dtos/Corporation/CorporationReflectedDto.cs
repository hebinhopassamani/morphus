using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class CorporationReflectedDto : MpxDto<Corporation, CorporationReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string PersonType { get; set; } = "PJ";
  public string? CpfCnpj { get; set; }
  public string? FullName { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }

  protected override Expression<Func<Corporation, CorporationReflectedDto>> BaseProjection => c => new CorporationReflectedDto
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
