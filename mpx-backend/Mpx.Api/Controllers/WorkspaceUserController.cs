using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/workspace-user")]
public class WorkspaceUserController(WorkspaceUserHandler workspaceUserHandler) : ControllerBase
{
  [HttpGet("entities-to-relate")]
  [HttpGet("entities-to-relate/{workspaceId:guid}")]
  [Authorize(Policy = "WORKSPACE_USER_LIST")]
  public async Task<IActionResult> GetEntitiesToRelate(Guid workspaceId) =>
      Ok(await workspaceUserHandler.GetEntitiesToRelateAsync(workspaceId));

  [HttpGet("related-entities")]
  [HttpGet("related-entities/{workspaceId:guid}")]
  [Authorize(Policy = "WORKSPACE_USER_LIST")]
  public async Task<IActionResult> GetRelatedEntities(Guid workspaceId) =>
      Ok(await workspaceUserHandler.GetRelatedEntitiesAsync(workspaceId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "WORKSPACE_USER_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] WorkspaceUser workspaceUser) =>
      Ok(await workspaceUserHandler.AddRelationshipAsync(workspaceUser));

  [HttpPost("add-relationships")]
  [Authorize(Policy = "WORKSPACE_USER_ADD")]
  public async Task<IActionResult> AddRelationships([FromBody] List<WorkspaceUser> items) =>
      Ok(await workspaceUserHandler.AddRelationshipsAsync(items));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "WORKSPACE_USER_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] WorkspaceUser workspaceUser) =>
      Ok(await workspaceUserHandler.RemoveRelationshipAsync(workspaceUser));

  [HttpPost("remove-relationships")]
  [Authorize(Policy = "WORKSPACE_USER_REMOVE")]
  public async Task<IActionResult> RemoveRelationships([FromBody] List<WorkspaceUser> items) =>
      Ok(await workspaceUserHandler.RemoveRelationshipsAsync(items));

  [HttpPost("activate")]
  [Authorize(Policy = "WORKSPACE_USER_ACTIVATE")]
  public async Task<IActionResult> Activate([FromBody] WorkspaceUser workspaceUser)
  {
    await workspaceUserHandler.ActivateAsync(workspaceUser);
    return Ok(true);
  }

  [HttpPost("deactivate")]
  [Authorize(Policy = "WORKSPACE_USER_INACTIVATE")]
  public async Task<IActionResult> Deactivate([FromBody] WorkspaceUser workspaceUser)
  {
    await workspaceUserHandler.DeactivateAsync(workspaceUser);
    return Ok(true);
  }

  [HttpPost("set-owner")]
  [Authorize(Policy = "WORKSPACE_USER_SET_OWNER")]
  public async Task<IActionResult> SetOwner([FromBody] WorkspaceUser workspaceUser)
  {
    await workspaceUserHandler.SetOwnerAsync(workspaceUser, true);
    return Ok(true);
  }

  [HttpPost("remove-owner")]
  [Authorize(Policy = "WORKSPACE_USER_REMOVE_OWNER")]
  public async Task<IActionResult> RemoveOwner([FromBody] WorkspaceUser workspaceUser)
  {
    await workspaceUserHandler.SetOwnerAsync(workspaceUser, false);
    return Ok(true);
  }
}
