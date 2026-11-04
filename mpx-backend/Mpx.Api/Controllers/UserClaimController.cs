using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/user-claim")]
public class UserClaimController(UserClaimHandler userClaimHandler) : ControllerBase
{
  [HttpGet("entities-to-relate")]
  [Authorize(Policy = "USER_CLAIM_LIST")]
  public async Task<IActionResult> GetEntitiesToRelate([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId, [FromQuery] Guid? applicationId = null) =>
      Ok(await userClaimHandler.GetEntitiesToRelateAsync(userId, moduleId, subModuleId, applicationId));

  [HttpGet("related-entities")]
  [Authorize(Policy = "USER_CLAIM_LIST")]
  public async Task<IActionResult> GetRelatedEntities([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId, [FromQuery] Guid? applicationId = null) =>
      Ok(await userClaimHandler.GetRelatedEntitiesAsync(userId, moduleId, subModuleId, applicationId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "USER_CLAIM_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] UserClaim userClaim) =>
      Ok(await userClaimHandler.AddRelationshipAsync(userClaim));

  [HttpPost("add-relationships")]
  [Authorize(Policy = "USER_CLAIM_ADD")]
  public async Task<IActionResult> AddRelationships([FromBody] List<UserClaim> userClaims) =>
      Ok(await userClaimHandler.AddRelationshipsAsync(userClaims));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "USER_CLAIM_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] UserClaim userClaim) =>
      Ok(await userClaimHandler.RemoveRelationshipAsync(userClaim));

  [HttpPost("remove-relationships")]
  [Authorize(Policy = "USER_CLAIM_REMOVE")]
  public async Task<IActionResult> RemoveRelationships([FromBody] List<UserClaim> userClaims) =>
      Ok(await userClaimHandler.RemoveRelationshipsAsync(userClaims));

  [HttpPost("activate")]
  [Authorize(Policy = "USER_CLAIM_ACTIVATE")]
  public async Task<IActionResult> Activate([FromBody] UserClaim userClaim)
  {
    await userClaimHandler.ActivateAsync(userClaim);
    return Ok(true);
  }

  [HttpPost("deactivate")]
  [Authorize(Policy = "USER_CLAIM_INACTIVATE")]
  public async Task<IActionResult> Deactivate([FromBody] UserClaim userClaim)
  {
    await userClaimHandler.DeactivateAsync(userClaim);
    return Ok(true);
  }
}

