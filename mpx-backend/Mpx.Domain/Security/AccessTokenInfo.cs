namespace Mpx.Domain.Security;

public class AccessTokenInfo
{
  public DateTime CreationDate { get; set; }
  public DateTime ExpirationDate { get; set; }
  public long ExpirationTime { get; set; }
  public required string Value { get; set; }
}
