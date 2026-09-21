namespace Morphus.Domain.Dtos.Security;

public class AccessTokenDto
{
  public DateTime? CreationDate { get; set; }
  public DateTime? ExpirationDate { get; set; }
  public long? ExpirationTime { get; set; }
  public string? Value { get; set; }
}
