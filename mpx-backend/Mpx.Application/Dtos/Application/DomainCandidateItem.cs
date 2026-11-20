namespace Mpx.Application.Dtos;

public sealed class DomainCandidateItem
{
  public required string Subdomain { get; set; }
  public required string FullDomain { get; set; }
  public bool Available { get; set; }
}
