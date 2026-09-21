using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Morphus.Application.MorphusValidator;

public abstract class MorphusValidator<T>(IHttpContextAccessor httpContextAccessor) : IMorphusValidator<T> where T : class
{
  private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
  private Guid? _businessId;

  private List<string> ErrorMessages { get; set; } = [];

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

        return Guid.Parse(businessId.ToString());
      }

      return null;
    }
    set { _businessId = value; }
  }

  public void AddErrorMessage(string message)
  {
    this.ErrorMessages.Add(message);
  }

  public bool IsValid()
  {
    return ErrorMessages.Count == 0;
  }

  public string ErrorMessage
  {
    get
    {
      if (this.ErrorMessages.Count > 0)
      {
        return this.ErrorMessages[0];
      }

      return "";
    }
  }
}
