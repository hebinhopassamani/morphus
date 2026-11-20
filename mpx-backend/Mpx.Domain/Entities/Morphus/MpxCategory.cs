using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxCategory : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public string Label { get; set; } = string.Empty;
  public string? Color { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual ICollection<MpxApplication> Applications { get; set; } = [];
}

