using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.Entities.Security;

public class MorphusSession
{
  public User? User { get; set; }
  public AccesssToken? AccessToken { get; set; }
  public RefreshToken? RefreshToken { get; set; }
  public Business? Business { get; set; }
}
