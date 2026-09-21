using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Domain.Entities.Models;
using Morphus.Application.MorphusController;
using Morphus.Domain.Filters;
using Morphus.Application.Services.UserService;
using Morphus.Application.Validators;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/user")]
public class UserController(IUserValidator mpsUservallidator, IUserService mpsUserService, IHttpContextAccessor httpContext) : MorphusController<User>(httpContext)
{
  private readonly IUserValidator userValidator = mpsUservallidator;
  private readonly IUserService userService = mpsUserService;

  [HttpGet]
  [Route("{id}")]
  [Authorize(Policy = "USER_GET_BY_ID")]
  public async Task<ObjectResult> GetById(Guid id)
  {
    var user = await userService.GetById(id);

    return Ok(user);
  }

  [HttpPost]
  [Route("filter")]
  [Authorize(Policy = "USER_LIST")]
  public async Task<ObjectResult> GetList([FromBody] MorphusFilter? filter)
  {
    var users = await userService.GetList(filter);

    return Ok(users);
  }

  [HttpPost]
  [Route("create")]
  [Authorize(Policy = "USER_CREATE")]
  public async Task<IActionResult> Create([FromBody] User user)
  {
    user = await userService.Create(user);

    return Ok(user);
  }

  [HttpPut]
  [Route("update")]
  [Authorize(Policy = "USER_UPDATE")]
  public async Task<IActionResult> Update([FromBody] User user)
  {
    user = await userService.Update(user);

    return Ok(user);
  }

  [HttpDelete()]
  [Route("delete/{id}")]
  [Authorize(Policy = "USER_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await userValidator.ValidateDeleteEntity(id);

    if (userValidator.IsValid())
    {
      var entity = await userService.Delete(id);

      return Ok(entity);
    }

    return MorphusErrorMessage(userValidator.ErrorMessage);
  }

  [HttpGet]
  [Route("existsEmail")]
  public async Task<ObjectResult> ExistsEmail([FromQuery] string email, [FromQuery] Guid? userId)
  {
    await Task.Delay(2000);
    var entity = await userService.ExistsEmail(email, userId);

    return Ok(entity);
  }
}
