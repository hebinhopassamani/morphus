using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/role-claim")]
public class RoleClaimController(RoleClaimHandler roleClaimHandler) : ControllerBase
{
  [HttpGet("entities-to-relate")]
  [Authorize(Policy = "ROLE_CLAIM_LIST")]
  public async Task<IActionResult> GetEntitiesToRelate([FromQuery] Guid roleId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId) =>
      Ok(await roleClaimHandler.GetEntitiesToRelateAsync(roleId, moduleId, subModuleId));

  [HttpGet("related-entities")]
  [Authorize(Policy = "ROLE_CLAIM_LIST")]
  public async Task<IActionResult> GetRelatedEntities([FromQuery] Guid roleId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId) =>
      Ok(await roleClaimHandler.GetRelatedEntitiesAsync(roleId, moduleId, subModuleId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "ROLE_CLAIM_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] RoleClaim roleClaim) =>
      Ok(await roleClaimHandler.AddRelationshipAsync(roleClaim));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "ROLE_CLAIM_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] RoleClaim roleClaim) =>
      Ok(await roleClaimHandler.RemoveRelationshipAsync(roleClaim));

  [HttpPost("activate")]
  [Authorize(Policy = "ROLE_CLAIM_ACTIVATE")]
  public async Task<IActionResult> Activate([FromBody] RoleClaim roleClaim)
  {
    await roleClaimHandler.ActivateAsync(roleClaim);
    return Ok(true);
  }

  [HttpPost("deactivate")]
  [Authorize(Policy = "ROLE_CLAIM_INACTIVATE")]
  public async Task<IActionResult> Deactivate([FromBody] RoleClaim roleClaim)
  {
    await roleClaimHandler.DeactivateAsync(roleClaim);
    return Ok(true);
  }
}

