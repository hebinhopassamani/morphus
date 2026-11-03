namespace Mpx.Domain.Entities;

public abstract class MorphusEntity
{
  public Guid Id { get; set; }
  public string Key { get; set; } = GenerateKey();
  public bool System { get; set; }
  public bool Inactive { get; set; }

  public static string GenerateKey() => Guid.NewGuid().ToString("N")[..12].ToUpperInvariant();
}
