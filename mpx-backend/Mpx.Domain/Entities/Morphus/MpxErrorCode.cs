using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxErrorCode : MpxEntity, IMpxTenant
{
  public required string Code { get; set; }
  public required string Name { get; set; }
  public Guid CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public Guid? ApplicationId { get; set; }
  public required string FriendlyMessage { get; set; }
  public int Sla { get; set; } = 60;
  public Guid SeverityId { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual MpxApplication? Application { get; set; }
  public virtual MpxErrorSeverity? Severity { get; set; }
  public virtual ICollection<MpxError> Errors { get; set; } = [];
}
