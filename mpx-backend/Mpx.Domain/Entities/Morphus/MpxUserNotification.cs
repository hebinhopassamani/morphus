using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxUserNotification : MpxEntity
{
  public Guid? CorporationId { get; set; }
  public Guid NotificationId { get; set; }
  public Guid UserId { get; set; }
  public bool Read { get; set; }
  public DateTime? ReadAtUtc { get; set; }
  public bool Acknowledged { get; set; }
  public DateTime? AcknowledgedAtUtc { get; set; }
  public bool Dismissed { get; set; }
  public DateTime? DismissedAtUtc { get; set; }
  public bool Pinned { get; set; }
  public bool DeliveredInApp { get; set; } = true;
  public bool DeliveredViaEmail { get; set; }
  public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxNotification? Notification { get; set; }
  public virtual SecUser? User { get; set; }
}
