using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/application")]
public class ApplicationController(
    ApplicationHandler applicationHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<MorphusApplication>(httpContext)
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "APPLICATION_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await applicationHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "APPLICATION_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await applicationHandler.GetListAsync());

  [HttpGet("workspace/{workspaceId:guid}")]
  [Authorize(Policy = "APPLICATION_LIST")]
  public async Task<IActionResult> GetByWorkspace(Guid workspaceId) =>
      Ok(await applicationHandler.GetByWorkspaceAsync(workspaceId));

  [HttpGet("key/{key}")]
  [Authorize(Policy = "APPLICATION_GET_BY_KEY")]
  public async Task<IActionResult> GetByKey(string key) =>
      Ok(await applicationHandler.GetByKeyAsync(key));

  [HttpPost]
  [Authorize(Policy = "APPLICATION_CREATE")]
  public async Task<IActionResult> Create([FromBody] MorphusApplication application) =>
      Ok(await applicationHandler.CreateAsync(application, UserId));

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "APPLICATION_UPDATE")]
  public async Task<IActionResult> Update([FromBody] MorphusApplication application, Guid? id = null)
  {
    if (id.HasValue && application.Id == Guid.Empty)
      application.Id = id.Value;

    return Ok(await applicationHandler.UpdateAsync(application));
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "APPLICATION_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await applicationHandler.DeleteAsync(id);
    return NoContent();
  }
}
