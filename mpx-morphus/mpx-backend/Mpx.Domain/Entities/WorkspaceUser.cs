using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class WorkspaceUser : IMorphusTenant
{
  public Guid WorkspaceId { get; set; }
  public Guid UserId { get; set; }
  public Guid CorporationId { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }
  public bool IsOwner { get; set; }

  public virtual Workspace? Workspace { get; set; }
  public virtual User? User { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
