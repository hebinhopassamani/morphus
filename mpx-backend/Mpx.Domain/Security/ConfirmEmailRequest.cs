namespace Mpx.Domain.Security;

public class ConfirmEmailRequest
{
  public required string Email { get; set; }
  public required string Token { get; set; }
}
