using Mpx.Core.Interfaces;

namespace Mpx.Core.Entities;

public abstract class MpxRelatedEntity : IMpxTenant
{
  public Guid CorporationId { get; set; }
  public bool System { get; set; }
  public bool Inactive { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
