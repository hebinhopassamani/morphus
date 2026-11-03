using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Mpx.Application.MorphusValidator;

public abstract class MorphusValidator<T>(IHttpContextAccessor httpContextAccessor) : IMorphusValidator<T> where T : class
{
  private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
  private Guid? _corporationId;
  private readonly List<string> _errorMessages = [];

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

  public void AddErrorMessage(string message)
  {
    _errorMessages.Add(message);
  }

  public bool IsValid()
  {
    return _errorMessages.Count == 0;
  }

  public string ErrorMessage => _errorMessages.Count > 0 ? _errorMessages[0] : string.Empty;

  public IReadOnlyList<string> ErrorMessages => _errorMessages;
}
