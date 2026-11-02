using Microsoft.AspNetCore.Http;
using Mpx.Infrastructure.Interfaces;

namespace Mpx.Infrastructure.MultiTenant;

public class TenantProvider(IHttpContextAccessor httpContextAccessor) : ITenantProvider
{
  public Guid GetCorporationId()
  {
    var user = httpContextAccessor.HttpContext?.User;

    if (user == null || user.Identity?.IsAuthenticated != true)
    {
      throw new UnauthorizedAccessException("Usuário não autenticado no Morphus.");
    }

    var corporationClaim = user.FindFirst("corporation_id")?.Value
                        ?? user.FindFirst("org_id")?.Value;

    if (Guid.TryParse(corporationClaim, out var corporationId) && corporationId != Guid.Empty)
    {
      return corporationId;
    }

    throw new UnauthorizedAccessException("Acesso negado: Corporação não identificada para o usuário atual.");
  }
}
