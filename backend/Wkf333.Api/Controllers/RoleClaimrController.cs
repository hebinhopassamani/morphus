using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.RoleClaimService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/roleClaim")]
public class RoleClaimController(IRoleClaimService mpsRoleClaimService, IHttpContextAccessor httpContext) : MorphusController<RoleClaim>(httpContext)
{
  private readonly IRoleClaimService roleClaimService = mpsRoleClaimService;

  [HttpGet]
  [Route("entitiesToRelate")]
  [Authorize(Policy = "ROLE_CLAIM_LIST")]
  public async Task<ObjectResult> GetEntitiesToRelate([FromQuery] Guid roleId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId)
  {
    var claims = await roleClaimService.GetEntitiesToRelate(roleId, moduleId, subModuleId);

    return Ok(claims);
  }

  [HttpGet]
  [Route("relatedEntities")]
  [Authorize(Policy = "ROLE_CLAIM_LIST")]
  public async Task<ObjectResult> GetRelatedEntities([FromQuery] Guid roleId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId)
  {
    var roleClaims = await roleClaimService.GetRelatedEntities(roleId, moduleId, subModuleId);

    return Ok(roleClaims);
  }

  [HttpPost]
  [Route("addRelationship")]
  [Authorize(Policy = "ROLE_CLAIM_ADD")]
  public async Task<ObjectResult> AddRelationship([FromBody] RoleClaim roleClaim)
  {
    roleClaim = await roleClaimService.AddRelationship(roleClaim);

    return Ok(roleClaim);
  }

  [HttpPost]
  [Route("removeRelationship")]
  [Authorize(Policy = "ROLE_CLAIM_REMOVE")]
  public async Task<ObjectResult> RemoveRelationship([FromBody] RoleClaim roleClaim)
  {
    roleClaim = await roleClaimService.RemoveRelationship(roleClaim);

    return Ok(roleClaim);
  }

  [HttpPost]
  [Route("activate")]
  [Authorize(Policy = "ROLE_CLAIM_ACTIVATE")]
  public async Task<ObjectResult> Activate([FromBody] RoleClaim roleClaim)
  {
    await roleClaimService.Activate(roleClaim);

    return Ok(true);
  }

  [HttpPost]
  [Route("deActivate")]
  [Authorize(Policy = "ROLE_CLAIM_INACTIVATE")]
  public async Task<ObjectResult> DeActivate([FromBody] RoleClaim roleClaim)
  {
    await roleClaimService.DeActivate(roleClaim);

    return Ok(true);
  }
}
