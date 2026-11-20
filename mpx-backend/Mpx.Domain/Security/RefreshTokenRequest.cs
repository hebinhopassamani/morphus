namespace Mpx.Domain.Security;

public class RefreshTokenRequest
{
  public required string RefreshToken { get; set; }
  public Guid? CorporationId { get; set; }
}
