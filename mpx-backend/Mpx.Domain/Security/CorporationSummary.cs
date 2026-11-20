namespace Mpx.Domain.Security;

public class CorporationSummary
{
  public Guid Id { get; set; }
  public required string Name { get; set; }
  public required string Key { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }
  public Guid? ParentCorporationId { get; set; }
  public bool IsOwner { get; set; }
  public bool Favorite { get; set; }
  public bool Inactive { get; set; }
  public List<string> Roles { get; set; } = [];
}
