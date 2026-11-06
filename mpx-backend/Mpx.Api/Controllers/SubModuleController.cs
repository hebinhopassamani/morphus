using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/sub-module")]
public class SubModuleController(
    SubModuleHandler subModuleHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<SubModule>(httpContext)
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "SUB_MODULE_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await subModuleHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "SUB_MODULE_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await subModuleHandler.GetListAsync());

  [HttpGet("module/{moduleId:guid}")]
  [HttpGet("by-module/{moduleId:guid}")]
  [Authorize(Policy = "SUB_MODULE_LIST")]
  public async Task<IActionResult> GetByModule(Guid moduleId) =>
      Ok(await subModuleHandler.GetByModuleIdAsync(moduleId));

  [HttpGet("{id:guid}/dependencies")]
  [Authorize(Policy = "SUB_MODULE_LIST")]
  public async Task<IActionResult> GetDependencies(Guid id) =>
      Ok(await subModuleHandler.GetDependenciesSummaryAsync(id));

  [HttpPost]
  [Authorize(Policy = "SUB_MODULE_CREATE")]
  public async Task<IActionResult> Create([FromBody] SubModule subModule) =>
      Ok(await subModuleHandler.CreateAsync(subModule));

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "SUB_MODULE_UPDATE")]
  public async Task<IActionResult> Update([FromBody] SubModule subModule, Guid? id = null)
  {
    if (id.HasValue && subModule.Id == Guid.Empty)
      subModule.Id = id.Value;

    return Ok(await subModuleHandler.UpdateAsync(subModule));
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "SUB_MODULE_DELETE")]
  public async Task<IActionResult> Delete(Guid id, [FromQuery] bool force = false)
  {
    await subModuleHandler.DeleteAsync(id, force);
    return NoContent();
  }
}
