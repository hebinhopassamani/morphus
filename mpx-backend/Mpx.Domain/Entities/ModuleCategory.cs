namespace Mpx.Domain.Entities;

public class ModuleCategory : MorphusEntity
{
  public required string Name { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }

  public virtual ICollection<ShowcaseModule> Modules { get; set; } = [];
}
