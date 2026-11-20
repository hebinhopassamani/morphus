namespace Mpx.Domain.Security;

public class CreateAccountRequest
{
  public string? CorporationName { get; set; }
  public string? CorporationFullName { get; set; }
  public string? CorporationIcon { get; set; }
  public string? CorporationEmail { get; set; }
  public string? AdminName { get; set; }
  public required string AdminEmail { get; set; }
  public required string AdminPassword { get; set; }
  public string? PhoneNumber { get; set; }
}
