using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class JrbSecurityScope : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public JarbassSecurityScopeEnum Code { get; set; } = JarbassSecurityScopeEnum.ByDocumentType;
  public string Label { get; set; } = string.Empty;
  public bool ApplyToInstance { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxFileType> FileTypes { get; set; } = [];
  public virtual ICollection<JrbProtectedFile> ProtectedFiles { get; set; } = [];
}
