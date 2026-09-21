using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.Dtos.Security;

public class MorphusSessionDto
{
  public User? User { get; set; }
  public AccessTokenDto? AccessToken { get; set; }
  public RefreshTokenDto? RefreshToken { get; set; }
  public Business? Business { get; set; }
}
