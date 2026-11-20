namespace Mpx.Domain.Security;

public class RefreshTokenInfo
{
  public DateTime CreationDate { get; set; }
  public DateTime ExpirationDate { get; set; }
  public long ExpirationTime { get; set; }
  public required string Value { get; set; }
}
