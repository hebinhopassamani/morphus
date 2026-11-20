namespace Mpx.Domain.Security;

public class UpdateUserProfileRequest
{
  public string? Name { get; set; }
  public string? FirstName { get; set; }
  public string? LastName { get; set; }
  public string? NickName { get; set; }
  public string? PhoneNumber { get; set; }
  public string? Website { get; set; }
}
