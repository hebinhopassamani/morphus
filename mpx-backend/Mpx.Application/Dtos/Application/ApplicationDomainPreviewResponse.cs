namespace Mpx.Application.Dtos;

public sealed class ApplicationDomainPreviewResponse
{
  public required string ResolvedPrefix { get; set; }
  public bool NameAndPrefixConflict { get; set; }
  public required string FirstAttemptSubdomain { get; set; }
  public required string FirstAttemptDomain { get; set; }
  public bool FirstAttemptAvailable { get; set; }
  public string? SuggestedAvailableSubdomain { get; set; }
  public string? SuggestedAvailableDomain { get; set; }
  public List<DomainCandidateItem> ProgressiveCandidates { get; set; } = [];
  public string? CustomAttemptSubdomain { get; set; }
  public string? CustomAttemptDomain { get; set; }
  public bool? CustomAttemptAvailable { get; set; }
}
