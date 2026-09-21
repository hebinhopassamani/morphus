using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Domain.Entities.Models;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.SubModuleSerrvice;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/subModule")]
public class SubModuleController(ISubModuleService mpsSubModuleService, IHttpContextAccessor httpContext) : MorphusController<SubModule>(httpContext)
{
  private readonly ISubModuleService subModuleService = mpsSubModuleService;

  [HttpGet]
  [Route("{id}")]
  [Authorize(Policy = "SUB_MODULE_GET_BY_ID")]
  public async Task<ObjectResult> GetById(Guid id)
  {
    var subModule = await subModuleService.GetById(id);

    return Ok(subModule);
  }

  [HttpPost]
  [Route("create")]
  [Authorize(Policy = "SUB_MODULE_CREATE")]
  public async Task<ObjectResult> Create([FromBody] SubModule subModule)
  {
    subModule = await subModuleService.Create(subModule);

    return Ok(subModule);
  }

  [HttpPut]
  [Route("update")]
  [Authorize(Policy = "SUB_MODULE_UPDATE")]
  public async Task<ObjectResult> Update([FromBody] SubModule subModule)
  {
    subModule = await subModuleService.Update(subModule);

    return Ok(subModule);
  }

  [HttpDelete()]
  [Route("delete/{id}")]
  [Authorize(Policy = "SUB_MODULE_DELETE")]
  public async Task<ObjectResult> Delete(Guid id)
  {
    var result = await subModuleService.Delete(id);

    return Ok(result);
  }
}
