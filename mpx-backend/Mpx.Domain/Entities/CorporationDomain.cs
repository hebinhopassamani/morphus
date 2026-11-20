using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class CorporationDomain : MpxEntity, IMpxTenant
{
  public required string DomainName { get; set; }
  public string OriginType { get; set; } = "CustomerOwned"; // "MorphusShared" | "CustomerOwned" | "PurchasedWithMorphus"
  public string VerificationStatus { get; set; } = "PendingVerification"; // "PendingVerification" | "Verified"
  public string? VerificationToken { get; set; }
  public bool IsPrimary { get; set; }
  public string? Description { get; set; }
  public Guid CorporationId { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual ICollection<CorporationDomainRecord> DomainRecords { get; set; } = [];
  public virtual ICollection<Application> Applications { get; set; } = [];
}

