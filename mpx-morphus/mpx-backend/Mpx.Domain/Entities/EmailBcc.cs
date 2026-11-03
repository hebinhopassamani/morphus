using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class EmailBcc : MorphusEntity, IMorphusTenant
{
  public required string Mail { get; set; }
  public string? Name { get; set; }

  public Guid EmailId { get; set; }
  public Guid CorporationId { get; set; }

  public required virtual Email Email { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
