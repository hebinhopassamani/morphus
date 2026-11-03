using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace Mpx.Application.MorphusController;

public abstract class MorphusController<T>(IHttpContextAccessor httpContext) : ControllerBase
{
  private readonly IHttpContextAccessor _httpContextAccessor = httpContext;
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

  [NonAction]
  public string? GetHeaderValue(string chave)
  {
    if (Request?.Headers is not null && Request.Headers.Any())
    {
      Request.Headers.TryGetValue(chave, out StringValues headerValue);
      return headerValue;
    }

    return null;
  }

  [NonAction]
  public IActionResult MorphusErrorMessage(string message)
  {
    return StatusCode(501, new { message });
  }
}
