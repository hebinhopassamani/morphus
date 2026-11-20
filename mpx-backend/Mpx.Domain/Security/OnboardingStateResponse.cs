using Mpx.Domain.Entities;

namespace Mpx.Domain.Security;

public class OnboardingStateResponse
{
  public Guid UserId { get; set; }
  public string? UserName { get; set; }
  public string? UserFirstName { get; set; }
  public string? UserLastName { get; set; }
  public string? UserNickName { get; set; }
  public string? UserEmail { get; set; }
  public bool EmailConfirmed { get; set; }
  public bool OnboardingCompleted { get; set; }
  public Guid? CorporationId { get; set; }
  public string? CorporationName { get; set; }
  public Guid? WorkspaceId { get; set; }
  public string? WorkspaceName { get; set; }
  public List<Application> AvailableApplications { get; set; } = [];
  public List<Guid> SelectedApplicationIds { get; set; } = [];
}
