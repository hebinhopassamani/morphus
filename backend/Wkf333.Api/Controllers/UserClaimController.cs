using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Domain.Entities.Models;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.UserClaimService;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/userClaim")]
public class UserClaimController(IUserClaimService mpsUserClaimService, IHttpContextAccessor httpContext) : MorphusController<UserClaim>(httpContext)
{
  private readonly IUserClaimService userClaimService = mpsUserClaimService;

  [HttpGet]
  [Route("entitiesToRelate")]
  [Authorize(Policy = "USER_CLAIM_LIST")]
  public async Task<ObjectResult> GetEntitiesToRelate([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId)
  {
    var claims = await userClaimService.GetEntitiesToRelate(userId, moduleId, subModuleId);

    return Ok(claims);
  }

  [HttpGet]
  [Route("relatedEntities")]
  [Authorize(Policy = "USER_CLAIM_LIST")]
  public async Task<ObjectResult> GetRelatedEntities([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId)
  {
    var userClaims = await userClaimService.GetRelatedEntities(userId, moduleId, subModuleId);

    return Ok(userClaims);
  }

  [HttpPost]
  [Route("addRelationship")]
  [Authorize(Policy = "USER_CLAIM_ADD")]
  public async Task<ObjectResult> AddRelationship([FromBody] UserClaim userClaim)
  {
    userClaim = await userClaimService.AddRelationship(userClaim);

    return Ok(userClaim);
  }

  [HttpPost]
  [Route("removeRelationship")]
  [Authorize(Policy = "USER_CLAIM_REMOVE")]
  public async Task<ObjectResult> RemoveRelationship([FromBody] UserClaim userClaim)
  {
    userClaim = await userClaimService.RemoveRelationship(userClaim);

    return Ok(userClaim);
  }

  [HttpPost]
  [Route("activate")]
  [Authorize(Policy = "USER_CLAIM_ACTIVATE")]
  public async Task<ObjectResult> Activate([FromBody] UserClaim userClaim)
  {
    await userClaimService.Activate(userClaim);

    return Ok(true);
  }

  [HttpPost]
  [Route("deActivate")]
  [Authorize(Policy = "USER_CLAIM_INACTIVATE")]
  public async Task<ObjectResult> DeActivate([FromBody] UserClaim userClaim)
  {
    await userClaimService.DeActivate(userClaim);

    return Ok(true);
  }
}
