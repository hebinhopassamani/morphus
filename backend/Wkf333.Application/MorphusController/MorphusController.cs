using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace Morphus.Application.MorphusController;

public class MorphusController<T>(IHttpContextAccessor httpContext) : ControllerBase
{
  private readonly IHttpContextAccessor _httpContextAccessor = httpContext;
  private Guid? _businessId;

  public Guid? BusinessId
  {
    get
    {
      if (_businessId is not null && _businessId != Guid.Empty)
        return _businessId;

      if (
          _httpContextAccessor?.HttpContext?.Request is not null
          && _httpContextAccessor.HttpContext.Request.Headers is not null
          && _httpContextAccessor.HttpContext.Request.Headers.Any()
      )
      {
        _httpContextAccessor.HttpContext.Request.Headers.TryGetValue("BusinessId", out StringValues businessId);

        _ = Guid.TryParse(businessId, out Guid guid);

        return guid;
      }

      return null;
    }
    set { _businessId = value; }
  }

  public string? GetHeaderValue(string chave)
  {
    if (Request is not null && Request.Headers is not null && Request.Headers.Any())
    {
      Request.Headers.TryGetValue(chave, out StringValues headerValue);

      return headerValue;
    }

    return null;
  }

  public IActionResult MorphusErrorMessage(string message)
  {
    return StatusCode(501, new { Message = message });
  }
}
