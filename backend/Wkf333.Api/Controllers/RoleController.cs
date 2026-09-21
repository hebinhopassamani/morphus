using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.RoleService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/role")]
public class RoleController(IRoleService mpsRoleService, IHttpContextAccessor httpContext) : MorphusController<Role>(httpContext)
{
  private readonly IRoleService roleService = mpsRoleService;

  [HttpGet]
  [Route("{id}")]
  [Authorize(Policy = "ROLE_GET_BY_ID")]
  public async Task<ObjectResult> GetById(Guid id)
  {
    var role = await roleService.GetById(id);

    return Ok(role);
  }

  [HttpPost]
  [Route("filter")]
  [Authorize(Policy = "ROLE_LIST")]
  public async Task<ObjectResult> GetList()
  {
    var roles = await roleService.GetList();

    return Ok(roles);
  }

  [HttpPost]
  [Route("create")]
  [Authorize(Policy = "ROLE_CREATE")]
  public async Task<ObjectResult> Create([FromBody] Role role)
  {
    role = await roleService.Create(role);

    return Ok(role);
  }

  [HttpPut]
  [Route("update")]
  [Authorize(Policy = "ROLE_UPDATE")]
  public async Task<ObjectResult> Update([FromBody] Role role)
  {
    role = await roleService.Update(role);

    return Ok(role);
  }

  [HttpDelete()]
  [Route("delete/{id}")]
  [Authorize(Policy = "ROLE_DELETE")]
  public async Task<ObjectResult> Delete(Guid id)
  {
    var result = await roleService.Delete(id);

    return Ok(result);
  }
}
