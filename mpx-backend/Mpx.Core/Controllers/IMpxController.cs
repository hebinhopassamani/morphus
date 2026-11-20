using Microsoft.AspNetCore.Mvc;

namespace Mpx.Core.Controllers;

public interface IMpxController<T>
{
  Guid? CorporationId { get; set; }
  Guid? UserId { get; }
  string? GetHeaderValue(string key);
  IActionResult MorphusErrorMessage(string message);
}
