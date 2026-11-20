using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class JrbSecurityLevel : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public JarbassSecurityLevelEnum Code { get; set; } = JarbassSecurityLevelEnum.Unrestricted;
  public string Label { get; set; } = string.Empty;
  public bool JarbassShouldIgnore { get; set; }
  public bool RequiresEncryptionAtRest { get; set; }
  public bool RequiresOnlineValidation { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxFileType> FileTypes { get; set; } = [];
  public virtual ICollection<JrbProtectedFile> InstanceProtectedFiles { get; set; } = [];
  public virtual ICollection<JrbProtectedFile> EffectiveProtectedFiles { get; set; } = [];
}
