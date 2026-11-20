namespace Mpx.Domain.Security;

public class OnboardingCorporationStepRequest
{
  public string? UserName { get; set; }
  public string? UserFirstName { get; set; }
  public string? UserLastName { get; set; }
  public string? UserNickName { get; set; }
  public required string CorporationName { get; set; }
}
