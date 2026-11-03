using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/menu")]
public class MenuController(
    MenuHandler menuHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<Menu>(httpContext)
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "MENU_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await menuHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "MENU_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await menuHandler.GetListAsync());

  [HttpGet("application/{applicationId:guid}")]
  public async Task<IActionResult> GetByApplicationId(Guid applicationId) =>
      Ok(await menuHandler.GetByApplicationIdAsync(applicationId));

  [HttpGet("application-key/{applicationKey}")]
  public async Task<IActionResult> GetByApplicationKey(string applicationKey) =>
      Ok(await menuHandler.GetByApplicationKeyAsync(applicationKey));

  [HttpPost]
  [Authorize(Policy = "MENU_CREATE")]
  public async Task<IActionResult> Create([FromBody] Menu menu) =>
      Ok(await menuHandler.CreateAsync(menu));

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "MENU_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Menu menu, Guid? id = null)
  {
    if (id.HasValue && menu.Id == Guid.Empty)
      menu.Id = id.Value;

    return Ok(await menuHandler.UpdateAsync(menu));
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "MENU_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await menuHandler.DeleteAsync(id);
    return NoContent();
  }
}
