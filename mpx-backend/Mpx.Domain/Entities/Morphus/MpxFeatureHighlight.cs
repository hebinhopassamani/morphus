using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxFeatureHighlight : MpxEntity
{
  public Guid FeatureId { get; set; }
  public required string Title { get; set; }
  public string? TitleIcon { get; set; }
  public required string Highlight { get; set; }
  public string? HighlightIcon { get; set; }
  public int Order { get; set; }

  public virtual MpxFeature? Feature { get; set; }
}

