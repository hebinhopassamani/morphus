namespace Mpx.Domain.Security;

public class LoginRequest
{
  public string? Email { get; set; }
  public string? Password { get; set; }
  public Guid? CorporationId { get; set; }
}
