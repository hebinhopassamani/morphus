namespace Mpx.Application.Dtos;

public sealed class ApplicationDomainPreviewRequest
{
  public string? Name { get; set; }
  public string? Prefix { get; set; }
  public string? DomainMode { get; set; }
  public string? CustomSubdomain { get; set; }
  public Guid? CorporationDomainId { get; set; }
  public Guid? ExcludeApplicationId { get; set; }
}
