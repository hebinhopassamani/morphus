using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/role")]
public class RoleController(
    RoleHandler roleHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<Role>(httpContext)
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "ROLE_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await roleHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "ROLE_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await roleHandler.GetListAsync());

  [HttpPost]
  [Authorize(Policy = "ROLE_CREATE")]
  public async Task<IActionResult> Create([FromBody] Role role) =>
      Ok(await roleHandler.CreateAsync(role));

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "ROLE_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Role role, Guid? id = null)
  {
    if (id.HasValue && role.Id == Guid.Empty)
      role.Id = id.Value;

    return Ok(await roleHandler.UpdateAsync(role));
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "ROLE_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await roleHandler.DeleteAsync(id);
    return NoContent();
  }
}
