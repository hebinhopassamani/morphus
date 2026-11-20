using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxWorkspace : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public string? Description { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public bool Default { get; set; }
  public Guid CorporationId { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxWorkspaceApplication> WorkspaceApplications { get; set; } = [];
  public virtual ICollection<MpxWorkspaceUser> WorkspaceUsers { get; set; } = [];
}

