using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class CorporationDomainRecord : MorphusEntity, IMorphusTenant
{
  public Guid CorporationId { get; set; }
  public Guid CorporationDomainId { get; set; }
  public string RecordType { get; set; } = "CNAME"; // "CNAME" | "TXT" | "A" | "MX"
  public required string HostName { get; set; }
  public required string Value { get; set; }
  public int Ttl { get; set; } = 3600;
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual CorporationDomain? CorporationDomain { get; set; }
}
