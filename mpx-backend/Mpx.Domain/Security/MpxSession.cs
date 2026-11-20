using Mpx.Domain.Entities;

namespace Mpx.Domain.Security;

public class MpxSession
{
  public User? User { get; set; }
  public Corporation? Corporation { get; set; }
  public AccessTokenInfo? AccessToken { get; set; }
  public RefreshTokenInfo? RefreshToken { get; set; }
  public List<CorporationSummary> AvailableCorporations { get; set; } = [];
}
