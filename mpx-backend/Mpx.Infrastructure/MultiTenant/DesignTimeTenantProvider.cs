using Mpx.Infrastructure.Interfaces;

namespace Mpx.Infrastructure.MultiTenant;

public class DesignTimeTenantProvider : ITenantProvider
{
  public Guid GetCorporationId() => Guid.Empty;
}
