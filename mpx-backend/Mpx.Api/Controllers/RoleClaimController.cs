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
  public async Task<IActionResult> GetEntitiesToRelate([FromQuery] Guid roleId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId, [FromQuery] Guid? applicationId = null) =>
      Ok(await roleClaimHandler.GetEntitiesToRelateAsync(roleId, moduleId, subModuleId, applicationId));

  [HttpGet("related-entities")]
  [Authorize(Policy = "ROLE_CLAIM_LIST")]
  public async Task<IActionResult> GetRelatedEntities([FromQuery] Guid roleId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId, [FromQuery] Guid? applicationId = null) =>
      Ok(await roleClaimHandler.GetRelatedEntitiesAsync(roleId, moduleId, subModuleId, applicationId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "ROLE_CLAIM_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] RoleClaim roleClaim) =>
      Ok(await roleClaimHandler.AddRelationshipAsync(roleClaim));

  [HttpPost("add-relationships")]
  [Authorize(Policy = "ROLE_CLAIM_ADD")]
  public async Task<IActionResult> AddRelationships([FromBody] List<RoleClaim> roleClaims) =>
      Ok(await roleClaimHandler.AddRelationshipsAsync(roleClaims));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "ROLE_CLAIM_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] RoleClaim roleClaim) =>
      Ok(await roleClaimHandler.RemoveRelationshipAsync(roleClaim));

  [HttpPost("remove-relationships")]
  [Authorize(Policy = "ROLE_CLAIM_REMOVE")]
  public async Task<IActionResult> RemoveRelationships([FromBody] List<RoleClaim> roleClaims) =>
      Ok(await roleClaimHandler.RemoveRelationshipsAsync(roleClaims));

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

