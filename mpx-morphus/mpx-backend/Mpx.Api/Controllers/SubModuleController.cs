using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/sub-module")]
public class SubModuleController(SubModuleHandler subModuleHandler) : ControllerBase
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "SUB_MODULE_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await subModuleHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "SUB_MODULE_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await subModuleHandler.GetListAsync());

  [HttpPost]
  [Authorize(Policy = "SUB_MODULE_CREATE")]
  public async Task<IActionResult> Create([FromBody] SubModule subModule) =>
      Ok(await subModuleHandler.CreateAsync(subModule));

  [HttpPut]
  [Authorize(Policy = "SUB_MODULE_UPDATE")]
  public async Task<IActionResult> Update([FromBody] SubModule subModule) =>
      Ok(await subModuleHandler.UpdateAsync(subModule));

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "SUB_MODULE_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await subModuleHandler.DeleteAsync(id);
    return NoContent();
  }
}

