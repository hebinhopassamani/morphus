using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using Mpx.Infrastructure.Interfaces;

namespace Mpx.Infrastructure.MultiTenant;

public class TenantProvider(IHttpContextAccessor httpContextAccessor) : ITenantProvider
{
  public Guid GetCorporationId()
  {
    var httpContext = httpContextAccessor.HttpContext;

    if (httpContext?.Request?.Headers is not null)
    {
      if (httpContext.Request.Headers.TryGetValue("X-Corporation-Id", out StringValues headerCorpId) &&
          Guid.TryParse(headerCorpId.ToString(), out var parsedHeaderId) &&
          parsedHeaderId != Guid.Empty)
      {
        return parsedHeaderId;
      }

      if (httpContext.Request.Headers.TryGetValue("CorporationId", out StringValues legacyCorpId) &&
          Guid.TryParse(legacyCorpId.ToString(), out var parsedLegacyId) &&
          parsedLegacyId != Guid.Empty)
      {
        return parsedLegacyId;
      }
    }

    var user = httpContext?.User;

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
