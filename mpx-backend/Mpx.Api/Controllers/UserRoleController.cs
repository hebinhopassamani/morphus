using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/user-role")]
public class UserRoleController(UserRoleHandler userRoleHandler) : ControllerBase
{
  [HttpGet("entities-to-relate")]
  [Authorize(Policy = "USER_ROLE_LIST")]
  public async Task<IActionResult> GetEntitiesToRelate([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId, [FromQuery] Guid? applicationId = null) =>
      Ok(await userRoleHandler.GetEntitiesToRelateAsync(userId, moduleId, subModuleId, applicationId));

  [HttpGet("related-entities")]
  [Authorize(Policy = "USER_ROLE_LIST")]
  public async Task<IActionResult> GetRelatedEntities([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId, [FromQuery] Guid? applicationId = null) =>
      Ok(await userRoleHandler.GetRelatedEntitiesAsync(userId, moduleId, subModuleId, applicationId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "USER_ROLE_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] UserRole userRole) =>
      Ok(await userRoleHandler.AddRelationshipAsync(userRole));

  [HttpPost("add-relationships")]
  [Authorize(Policy = "USER_ROLE_ADD")]
  public async Task<IActionResult> AddRelationships([FromBody] List<UserRole> userRoles) =>
      Ok(await userRoleHandler.AddRelationshipsAsync(userRoles));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "USER_ROLE_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] UserRole userRole) =>
      Ok(await userRoleHandler.RemoveRelationshipAsync(userRole));

  [HttpPost("remove-relationships")]
  [Authorize(Policy = "USER_ROLE_REMOVE")]
  public async Task<IActionResult> RemoveRelationships([FromBody] List<UserRole> userRoles) =>
      Ok(await userRoleHandler.RemoveRelationshipsAsync(userRoles));

  [HttpPost("activate")]
  [Authorize(Policy = "USER_ROLE_ACTIVATE")]
  public async Task<IActionResult> Activate([FromBody] UserRole userRole)
  {
    await userRoleHandler.ActivateAsync(userRole);
    return Ok(true);
  }

  [HttpPost("deactivate")]
  [Authorize(Policy = "USER_ROLE_INACTIVATE")]
  public async Task<IActionResult> Deactivate([FromBody] UserRole userRole)
  {
    await userRoleHandler.DeactivateAsync(userRole);
    return Ok(true);
  }
}

