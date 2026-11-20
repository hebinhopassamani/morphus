namespace Mpx.Domain.Security;

public class PortalPreferenceItem
{
  public required string TargetType { get; set; }
  public Guid TargetId { get; set; }
  public Guid CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public string? Color { get; set; }
  public bool Favorite { get; set; }
}
