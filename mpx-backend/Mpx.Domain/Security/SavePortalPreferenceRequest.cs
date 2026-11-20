namespace Mpx.Domain.Security;

public class SavePortalPreferenceRequest
{
  public required string TargetType { get; set; }
  public required Guid TargetId { get; set; }
  public Guid? CorporationId { get; set; }
  public Guid? WorkspaceId { get; set; }
  public string? Color { get; set; }
  public bool? Favorite { get; set; }
}
