using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class ApplicationStatus : MorphusEntity, IMorphusTenant
{
  public required string Name { get; set; }
  public string Label { get; set; } = string.Empty;
  public string? Color { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<MorphusApplication> Applications { get; set; } = [];
}
