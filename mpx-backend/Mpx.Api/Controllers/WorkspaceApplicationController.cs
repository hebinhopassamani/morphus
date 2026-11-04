using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/workspace-application")]
public class WorkspaceApplicationController(WorkspaceApplicationHandler workspaceApplicationHandler) : ControllerBase
{
  [HttpGet("entities-to-relate")]
  [HttpGet("entities-to-relate/{workspaceId:guid}")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_LIST")]
  public async Task<IActionResult> GetEntitiesToRelate(Guid workspaceId) =>
      Ok(await workspaceApplicationHandler.GetEntitiesToRelateAsync(workspaceId));

  [HttpGet("related-entities")]
  [HttpGet("related-entities/{workspaceId:guid}")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_LIST")]
  public async Task<IActionResult> GetRelatedEntities(Guid workspaceId) =>
      Ok(await workspaceApplicationHandler.GetRelatedEntitiesAsync(workspaceId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] WorkspaceApplication workspaceApplication) =>
      Ok(await workspaceApplicationHandler.AddRelationshipAsync(workspaceApplication));

  [HttpPost("add-relationships")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_ADD")]
  public async Task<IActionResult> AddRelationships([FromBody] List<WorkspaceApplication> items) =>
      Ok(await workspaceApplicationHandler.AddRelationshipsAsync(items));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] WorkspaceApplication workspaceApplication) =>
      Ok(await workspaceApplicationHandler.RemoveRelationshipAsync(workspaceApplication));

  [HttpPost("remove-relationships")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_REMOVE")]
  public async Task<IActionResult> RemoveRelationships([FromBody] List<WorkspaceApplication> items) =>
      Ok(await workspaceApplicationHandler.RemoveRelationshipsAsync(items));

  [HttpPost("activate")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_ACTIVATE")]
  public async Task<IActionResult> Activate([FromBody] WorkspaceApplication workspaceApplication)
  {
    await workspaceApplicationHandler.ActivateAsync(workspaceApplication);
    return Ok(true);
  }

  [HttpPost("deactivate")]
  [Authorize(Policy = "WORKSPACE_APPLICATION_INACTIVATE")]
  public async Task<IActionResult> Deactivate([FromBody] WorkspaceApplication workspaceApplication)
  {
    await workspaceApplicationHandler.DeactivateAsync(workspaceApplication);
    return Ok(true);
  }
}
