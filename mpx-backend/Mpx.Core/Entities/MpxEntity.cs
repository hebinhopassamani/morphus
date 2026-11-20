using Mpx.Core.Security;

namespace Mpx.Core.Entities;

public abstract class MpxEntity
{
  public Guid Id { get; set; } = Guid.CreateVersion7();
  public string Key { get; set; } = MpxKey.Generate();
  public bool System { get; set; }
  public bool Inactive { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

  public static string GenerateKey() => MpxKey.Generate();
}
