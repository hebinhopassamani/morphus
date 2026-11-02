using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/workspace")]
public class WorkspaceController(WorkspaceHandler workspaceHandler) : ControllerBase
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "WORKSPACE_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await workspaceHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "WORKSPACE_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await workspaceHandler.GetListAsync());

  [HttpGet("key/{key}")]
  [Authorize(Policy = "WORKSPACE_GET_BY_KEY")]
  public async Task<IActionResult> GetByKey(string key) =>
      Ok(await workspaceHandler.GetByKeyAsync(key));

  [HttpPost]
  [Authorize(Policy = "WORKSPACE_CREATE")]
  public async Task<IActionResult> Create([FromBody] Workspace workspace)
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? User.FindFirst("sub")?.Value;
    Guid.TryParse(userIdClaim, out var creatorUserId);

    return Ok(await workspaceHandler.CreateAsync(workspace, creatorUserId));
  }

  [HttpPut]
  [Authorize(Policy = "WORKSPACE_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Workspace workspace) =>
      Ok(await workspaceHandler.UpdateAsync(workspace));

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "WORKSPACE_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await workspaceHandler.DeleteAsync(id);
    return NoContent();
  }
}
