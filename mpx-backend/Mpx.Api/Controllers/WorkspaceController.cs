using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Application.Validators;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/workspace")]
public class WorkspaceController(
    IWorkspaceValidator mpsValidator,
    WorkspaceHandler workspaceHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<Workspace>(httpContext)
{
  private readonly IWorkspaceValidator validator = mpsValidator;

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
    await validator.ValidateWorkspace(workspace);

    if (validator.IsValid())
    {
      var result = await workspaceHandler.CreateAsync(workspace, UserId);
      return Ok(result);
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "WORKSPACE_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Workspace workspace, Guid? id = null)
  {
    if (id.HasValue && workspace.Id == Guid.Empty)
      workspace.Id = id.Value;

    await validator.ValidateWorkspace(workspace);

    if (validator.IsValid())
    {
      var result = await workspaceHandler.UpdateAsync(workspace);
      return Ok(result);
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "WORKSPACE_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await validator.ValidateDeleteWorkspace(id);

    if (validator.IsValid())
    {
      await workspaceHandler.DeleteAsync(id);
      return NoContent();
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }
}
