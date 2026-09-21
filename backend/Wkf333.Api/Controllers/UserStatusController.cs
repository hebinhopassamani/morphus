using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Domain.Entities.Models;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.UserStatusSerrvice;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/userStatus")]
public class UserStatusController(IUserStatusService mpsUserStatusService, IHttpContextAccessor httpContext) : MorphusController<UserStatus>(httpContext)
{
  private readonly IUserStatusService userStatusService = mpsUserStatusService;

  [HttpGet]
  [Route("{id}")]
  [Authorize(Policy = "USER_STATUS_GET_BY_ID")]
  public async Task<ObjectResult> GetById(Guid id)
  {
    var userStatus = await userStatusService.GetById(id);

    return Ok(userStatus);
  }

  [HttpPost]
  [Route("filter")]
  [Authorize(Policy = "USER_STATUS_LIST")]
  public async Task<ObjectResult> GetList()
  {
    var userStatus = await userStatusService.GetList();

    return Ok(userStatus);
  }

  [HttpPost]
  [Route("create")]
  [Authorize(Policy = "USER_STATUS_CREATE")]
  public async Task<ObjectResult> Create([FromBody] UserStatus userStatus)
  {
    userStatus = await userStatusService.Create(userStatus);

    return Ok(userStatus);
  }

  [HttpPut]
  [Route("update")]
  [Authorize(Policy = "USER_STATUS_UPDATE")]
  public async Task<ObjectResult> Update([FromBody] UserStatus userStatus)
  {
    userStatus = await userStatusService.Update(userStatus);

    return Ok(userStatus);
  }

  [HttpDelete()]
  [Route("delete/{id}")]
  [Authorize(Policy = "USER_STATUS_DELETE")]
  public async Task<ObjectResult> Delete(Guid id)
  {
    var result = await userStatusService.Delete(id);

    return Ok(result);
  }
}
