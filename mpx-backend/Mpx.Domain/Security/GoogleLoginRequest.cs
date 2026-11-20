namespace Mpx.Domain.Security;

public class GoogleLoginRequest
{
  public string? AccessToken { get; set; }
  public string? IdToken { get; set; }
  public Guid? CorporationId { get; set; }
}
