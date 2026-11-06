namespace Mpx.Domain.Entities;

public class ShowcaseModule : MorphusEntity
{
  public Guid CategoryId { get; set; }
  public string? Icon { get; set; }
  public required string Title { get; set; }
  public required string Description { get; set; }
  public required string ActionText { get; set; }
  public int Order { get; set; }

  public virtual ModuleCategory? Category { get; set; }
}
