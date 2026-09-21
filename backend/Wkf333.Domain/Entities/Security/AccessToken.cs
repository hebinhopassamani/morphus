namespace Morphus.Domain.Entities.Security;

public class AccesssToken
{
  public DateTime? CreationDate { get; set; }
  public DateTime? ExpirationDate { get; set; }
  public long? ExpirationTime { get; set; }
  public string? Value { get; set; }
}
