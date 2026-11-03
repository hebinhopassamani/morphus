using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Mpx.Application.MorphusHandler;

public abstract class MorphusHandler<T>(IHttpContextAccessor httpContextAccessor) : IMorphusHandler<T> where T : class
{
  protected readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
  private Guid? _corporationId;

  public Guid? CorporationId
  {
    get
    {
      if (_corporationId is not null && _corporationId != Guid.Empty)
        return _corporationId;

      var context = _httpContextAccessor?.HttpContext;
      if (context?.Request?.Headers is not null && context.Request.Headers.Any())
      {
        if (context.Request.Headers.TryGetValue("X-Corporation-Id", out StringValues headerCorpId) &&
            Guid.TryParse(headerCorpId, out Guid parsedHeaderGuid) &&
            parsedHeaderGuid != Guid.Empty)
        {
          return parsedHeaderGuid;
        }

        if (context.Request.Headers.TryGetValue("CorporationId", out StringValues legacyCorpId) &&
            Guid.TryParse(legacyCorpId, out Guid parsedLegacyGuid) &&
            parsedLegacyGuid != Guid.Empty)
        {
          return parsedLegacyGuid;
        }
      }

      var claimValue = context?.User?.FindFirst("corporation_id")?.Value
                    ?? context?.User?.FindFirst("org_id")?.Value;
      if (Guid.TryParse(claimValue, out Guid claimGuid) && claimGuid != Guid.Empty)
      {
        return claimGuid;
      }

      return null;
    }
    set { _corporationId = value; }
  }

  public Guid? UserId
  {
    get
    {
      var user = _httpContextAccessor?.HttpContext?.User;
      var claimValue = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? user?.FindFirst("sub")?.Value;
      return Guid.TryParse(claimValue, out Guid userGuid) && userGuid != Guid.Empty
          ? userGuid
          : null;
    }
  }

  public string? GetHeaderValue(string chave)
  {
    var headers = _httpContextAccessor?.HttpContext?.Request?.Headers;
    if (headers is not null && headers.Any())
    {
      headers.TryGetValue(chave, out StringValues value);
      return value;
    }

    return null;
  }
}
