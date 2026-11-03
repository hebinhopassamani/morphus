using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/user-status")]
public class UserStatusController(
    UserStatusHandler userStatusHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<UserStatus>(httpContext)
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "USER_STATUS_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await userStatusHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "USER_STATUS_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await userStatusHandler.GetListAsync());

  [HttpPost]
  [Authorize(Policy = "USER_STATUS_CREATE")]
  public async Task<IActionResult> Create([FromBody] UserStatus userStatus) =>
      Ok(await userStatusHandler.CreateAsync(userStatus));

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "USER_STATUS_UPDATE")]
  public async Task<IActionResult> Update([FromBody] UserStatus userStatus, Guid? id = null)
  {
    if (id.HasValue && userStatus.Id == Guid.Empty)
      userStatus.Id = id.Value;

    return Ok(await userStatusHandler.UpdateAsync(userStatus));
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "USER_STATUS_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await userStatusHandler.DeleteAsync(id);
    return NoContent();
  }
}
