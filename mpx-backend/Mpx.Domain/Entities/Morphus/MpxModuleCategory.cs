using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxModuleCategory : MpxEntity
{
  public required string Name { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }

  public virtual ICollection<MpxShowcaseModule> Modules { get; set; } = [];
}

