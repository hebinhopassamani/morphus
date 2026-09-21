using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.ModuleSerrvice;
using Morphus.Domain.Entities.Models;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/module")]
public class ModuleController(IModuleService mpsModuleService, IHttpContextAccessor httpContext) : MorphusController<Module>(httpContext)
{
  private readonly IModuleService moduleService = mpsModuleService;

  [HttpGet]
  [Route("{id}")]
  [Authorize(Policy = "MODULE_GET_BY_ID")]
  public async Task<ObjectResult> GetById(Guid id)
  {
    var module = await moduleService.GetById(id);

    return Ok(module);
  }

  [HttpGet]
  [Route("key/{key}")]
  [Authorize(Policy = "MODULE_GET_BY_KEY")]
  public async Task<ObjectResult> GetModulesByKey(string key)
  {
    var modules = await moduleService.GetModulesByKey(key);

    return Ok(modules);
  }

  [HttpPost]
  [Route("filter")]
  [Authorize(Policy = "MODULE_LIST")]
  public async Task<ObjectResult> GetList()
  {
    var modules = await moduleService.GetList();

    return Ok(modules);
  }

  [HttpPost]
  [Route("create")]
  [Authorize(Policy = "MODULE_CREATE")]
  public async Task<ObjectResult> Create([FromBody] Module module)
  {
    module = await moduleService.Create(module);

    return Ok(module);
  }

  [HttpPut]
  [Route("update")]
  [Authorize(Policy = "MODULE_UPDATE")]
  public async Task<ObjectResult> Update([FromBody] Module module)
  {
    module = await moduleService.Update(module);

    return Ok(module);
  }

  [HttpDelete()]
  [Route("delete/{id}")]
  [Authorize(Policy = "MODULE_DELETE")]
  public async Task<ObjectResult> Delete(Guid id)
  {
    var result = await moduleService.Delete(id);

    return Ok(result);
  }
}
