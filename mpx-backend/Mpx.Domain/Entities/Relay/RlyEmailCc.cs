using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class RlyEmailCc : MpxEntity, IMpxTenant
{
  public required string Mail { get; set; }
  public string? Name { get; set; }

  public Guid EmailId { get; set; }
  public Guid CorporationId { get; set; }

  public required virtual Email Email { get; set; }
  public virtual MpxCorporation? Corporation { get; set; }
}

