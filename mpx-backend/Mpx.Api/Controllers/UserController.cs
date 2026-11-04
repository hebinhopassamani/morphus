using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/user")]
public class UserController(UserHandler userHandler) : ControllerBase
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "USER_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await userHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "USER_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await userHandler.GetListAsync());

  [HttpPost]
  [Authorize(Policy = "USER_CREATE")]
  public async Task<IActionResult> Create([FromBody] User user, [FromQuery] string? password = null) =>
      Ok(await userHandler.CreateAsync(user, password));

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "USER_UPDATE")]
  public async Task<IActionResult> Update([FromBody] User user, [FromQuery] string? password = null, Guid? id = null)
  {
    if (id.HasValue && user.Id == Guid.Empty)
      user.Id = id.Value;

    return Ok(await userHandler.UpdateAsync(user, password));
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "USER_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await userHandler.DeleteAsync(id);
    return NoContent();
  }
}

