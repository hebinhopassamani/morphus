using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class ModuleCategory : MpxEntity
{
  public required string Name { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }

  public virtual ICollection<ShowcaseModule> Modules { get; set; } = [];
}

