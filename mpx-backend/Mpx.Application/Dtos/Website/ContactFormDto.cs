namespace Mpx.Application.Dtos;

public class ContactFormDto
{
  public string Name { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string? Company { get; set; }
  public string? Phone { get; set; }
  public string? Subject { get; set; }
  public string Message { get; set; } = string.Empty;
}
