using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public abstract class MorphusRelatedEntity : IMorphusTenant
{
  public Guid CorporationId { get; set; }
  public bool System { get; set; }
  public bool Inactive { get; set; }
}
