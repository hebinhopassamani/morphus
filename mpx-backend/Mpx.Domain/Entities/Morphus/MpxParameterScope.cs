using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class MpxParameterScope : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public MpxParameterScopeEnum Code { get; set; } = MpxParameterScopeEnum.SystemDefault;
  public required string Name { get; set; }
  public required string Label { get; set; }
  public bool IsSystemSovereign { get; set; }
  public bool IsExportableToJarbass { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxParameter> Parameters { get; set; } = [];
}
