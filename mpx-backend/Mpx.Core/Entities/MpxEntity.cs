using Mpx.Core.Security;

namespace Mpx.Core.Entities;

public abstract class MpxEntity
{
  public Guid Id { get; set; }
  public string Key { get; set; } = MpxKey.Generate();
  public bool System { get; set; }
  public bool Inactive { get; set; }

  public static string GenerateKey() => MpxKey.Generate();
}
