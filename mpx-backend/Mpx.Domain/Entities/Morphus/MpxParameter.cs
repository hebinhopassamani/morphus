using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class MpxParameter : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid ScopeId { get; set; }
  public MpxParameterScopeEnum ScopeCode { get; set; } = MpxParameterScopeEnum.SystemDefault;
  public Guid? WorkspaceId { get; set; }
  public Guid? ApplicationId { get; set; }
  public Guid? UserId { get; set; }
  public string? MachineKey { get; set; }
  public required string Namespace { get; set; }
  public required string Name { get; set; }
  public required string SettingsJson { get; set; }
  public bool IsLockedBySovereign { get; set; }
  public bool IsExportable { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxParameterScope? Scope { get; set; }
  public virtual MpxWorkspace? Workspace { get; set; }
  public virtual MpxApplication? Application { get; set; }
  public virtual SecUser? User { get; set; }
}
