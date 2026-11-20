using Mpx.Core.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Domain.Entities;

public class JrbEncryptionState : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public JarbassEncryptionStateEnum Code { get; set; } = JarbassEncryptionStateEnum.EncryptedAtRest;
  public string Label { get; set; } = string.Empty;
  public bool IsEncrypted { get; set; } = true;
  public bool IsHeldInHand { get; set; }
  public bool IsTamperLocked { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<JrbProtectedFile> ProtectedFiles { get; set; } = [];
}
