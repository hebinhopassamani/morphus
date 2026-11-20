namespace Mpx.Application.Dtos;

public sealed class UpdateApplicationBasicSettingsRequest
{
  public string? Name { get; set; }
  public string? DomainMode { get; set; }
  public string? Subdomain { get; set; }
  public Guid? CorporationDomainId { get; set; }
}
