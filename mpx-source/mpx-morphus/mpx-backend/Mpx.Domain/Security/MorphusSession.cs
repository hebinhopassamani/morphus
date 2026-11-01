using Mpx.Domain.Entities;

namespace Mpx.Domain.Security;

public class AccessTokenInfo
{
  public DateTime CreationDate { get; set; }
  public DateTime ExpirationDate { get; set; }
  public long ExpirationTime { get; set; }
  public required string Value { get; set; }
}

public class RefreshTokenInfo
{
  public DateTime CreationDate { get; set; }
  public DateTime ExpirationDate { get; set; }
  public long ExpirationTime { get; set; }
  public required string Value { get; set; }
}

public class LoginRequest
{
  public string? Email { get; set; }
  public string? Password { get; set; }
  public Guid? CorporationId { get; set; }
}

public class GoogleLoginRequest
{
  public string? AccessToken { get; set; }
  public string? IdToken { get; set; }
  public Guid? CorporationId { get; set; }
}

public class RefreshTokenRequest
{
  public required string RefreshToken { get; set; }
  public Guid? CorporationId { get; set; }
}

public class SwitchCorporationRequest
{
  public required Guid CorporationId { get; set; }
}

public class CreateAccountRequest
{
  public required string CorporationName { get; set; }
  public string? CorporationFullName { get; set; }
  public string? CorporationIcon { get; set; }
  public required string CorporationEmail { get; set; }
  public required string AdminName { get; set; }
  public required string AdminEmail { get; set; }
  public required string AdminPassword { get; set; }
  public string? PhoneNumber { get; set; }
}

public class ForgotPasswordRequest
{
  public required string Email { get; set; }
}

public class ResetPasswordRequest
{
  public required string Email { get; set; }
  public required string Token { get; set; }
  public required string NewPassword { get; set; }
}

public class MorphusSession
{
  public User? User { get; set; }
  public Corporation? Corporation { get; set; }
  public AccessTokenInfo? AccessToken { get; set; }
  public RefreshTokenInfo? RefreshToken { get; set; }
  public List<CorporationSummary> AvailableCorporations { get; set; } = [];
}

public class CorporationSummary
{
  public Guid Id { get; set; }
  public required string Name { get; set; }
  public required string Key { get; set; }
  public string? Icon { get; set; }
  public string? Description { get; set; }
  public Guid? ParentCorporationId { get; set; }
  public bool IsOwner { get; set; }
}
