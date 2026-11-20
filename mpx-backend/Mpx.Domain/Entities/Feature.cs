using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class Feature : MpxEntity
{
  public required string Title { get; set; }
  public required string HighlightPhrase { get; set; }
  public required string Description { get; set; }
  public int Order { get; set; }

  public virtual ICollection<FeatureHighlight> Highlights { get; set; } = [];
}

