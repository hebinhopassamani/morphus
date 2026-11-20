using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxFileType : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public required string Extension { get; set; }
  public required string MimeType { get; set; }
  public string Category { get; set; } = "Document";
  public int MaxSizeInMb { get; set; } = 10;
  public Guid CorporationId { get; set; }
  public string? Icon { get; set; }
  public string? Description { get; set; }

  // Governança de Segurança de Documentos via Relacionamento 1:N (Foreign Keys indexadas — 100% compatível com o App Builder / .Reflected!)
  public Guid? SecurityScopeId { get; set; }
  public Guid? SecurityLevelId { get; set; }
  public Guid? DefaultPermissionLevelId { get; set; }
  public string? DefaultRequiredClaimKey { get; set; }
  public int DefaultLeaseMinutes { get; set; } = 60;

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual JrbSecurityScope? SecurityScope { get; set; }
  public virtual JrbSecurityLevel? SecurityLevel { get; set; }
  public virtual JrbPermissionLevel? DefaultPermissionLevel { get; set; }
  public virtual ICollection<JrbProtectedFile> ProtectedFiles { get; set; } = [];
}
