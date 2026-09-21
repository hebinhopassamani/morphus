namespace Morphus.Domain.Dtos.Security;

public class LoginDto
{
  public Guid? BusinessId { get; set; }
  public string? Email { get; set; }
  public string? Password { get; set; }
  public string? RefreshToken { get; set; }
  public bool RefreshLogin { get; set; }
}
