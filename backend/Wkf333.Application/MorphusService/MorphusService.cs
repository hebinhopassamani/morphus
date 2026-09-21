using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Morphus.Application.MorphusService;

public abstract class MorphusService<T>(IHttpContextAccessor httpContextAccessor) : IMorphusService<T> where T : class
{
  private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
  private Guid? _businessId;

  public Guid? BusinessId
  {
    get
    {
      if (_businessId is not null && _businessId != Guid.Empty)
        return _businessId;

      if (_httpContextAccessor?.HttpContext?.Request is not null && _httpContextAccessor.HttpContext.Request.Headers is not null && _httpContextAccessor.HttpContext.Request.Headers.Any())
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
    if (_httpContextAccessor?.HttpContext?.Request is not null && _httpContextAccessor.HttpContext.Request.Headers is not null && _httpContextAccessor.HttpContext.Request.Headers.Any())
    {
      _httpContextAccessor.HttpContext.Request.Headers.TryGetValue(chave, out StringValues value);

      return value;
    }

    return null;
  }
}
