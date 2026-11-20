namespace Mpx.Core.Security;

public static class MpxKey
{
  public static string Generate() => Guid.NewGuid().ToString("N")[..12].ToUpperInvariant();
}
