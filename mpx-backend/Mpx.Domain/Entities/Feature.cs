namespace Mpx.Domain.Entities;

public class Feature : MorphusEntity
{
  public required string Title { get; set; }
  public required string HighlightPhrase { get; set; }
  public required string Description { get; set; }
  public int Order { get; set; }

  public virtual ICollection<FeatureHighlight> Highlights { get; set; } = [];
}
