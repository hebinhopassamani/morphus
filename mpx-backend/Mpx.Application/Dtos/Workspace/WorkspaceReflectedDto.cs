using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class WorkspaceReflectedDto : MpxDto<Workspace, WorkspaceReflectedDto>
{
  public string Name { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public bool Default { get; set; }

  protected override Expression<Func<Workspace, WorkspaceReflectedDto>> BaseProjection => w => new WorkspaceReflectedDto
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
