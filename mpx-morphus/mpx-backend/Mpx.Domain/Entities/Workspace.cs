using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class Workspace : IMorphusTenant
{
  public Guid Id { get; set; }
  public required string Name { get; set; }
  public required string Key { get; set; }
  public string? Description { get; set; }
  public string? Icon { get; set; }
  public bool System { get; set; }
  public bool Inactive { get; set; }
  public Guid CorporationId { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<WorkspaceApplication> WorkspaceApplications { get; set; } = [];
  public virtual ICollection<WorkspaceUser> WorkspaceUsers { get; set; } = [];
}
