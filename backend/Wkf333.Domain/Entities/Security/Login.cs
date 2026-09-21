namespace Morphus.Domain.Entities.Security;

public class Login
{
  public string? Email { get; set; }
  public string? Password { get; set; }
  public string? RefreshToken { get; set; }
  public bool RefreshLogin { get; set; } = false;
  public Guid? BusinessId { get; set; }
}
