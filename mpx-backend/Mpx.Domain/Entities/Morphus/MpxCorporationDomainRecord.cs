using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxCorporationDomainRecord : MpxEntity, IMpxTenant
{
  public Guid CorporationId { get; set; }
  public Guid CorporationDomainId { get; set; }
  public string RecordType { get; set; } = "CNAME"; // "CNAME" | "TXT" | "A" | "MX"
  public required string HostName { get; set; }
  public required string Value { get; set; }
  public int Ttl { get; set; } = 3600;
  public string? Description { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxCorporationDomain? CorporationDomain { get; set; }
}

