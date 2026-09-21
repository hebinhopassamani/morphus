using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Domain.Entities.Models;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.UserRoleService;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/userRole")]
public class UserRoleController(IUserRoleService mpsUserRoleService, IHttpContextAccessor httpContext) : MorphusController<UserRole>(httpContext)
{
  private readonly IUserRoleService userRoleService = mpsUserRoleService;

  [HttpGet]
  [Route("entitiesToRelate")]
  [Authorize(Policy = "USER_ROLE_LIST")]
  public async Task<ObjectResult> GetEntitiesToRelate([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId)
  {
    var roles = await userRoleService.GetEntitiesToRelate(userId, moduleId, subModuleId);

    return Ok(roles);
  }

  [HttpGet]
  [Route("relatedEntities")]
  [Authorize(Policy = "USER_ROLE_LIST")]
  public async Task<ObjectResult> GetRelatedEntities([FromQuery] Guid userId, [FromQuery] Guid? moduleId, [FromQuery] Guid? subModuleId)
  {
    var userRoles = await userRoleService.GetRelatedEntities(userId, moduleId, subModuleId);

    return Ok(userRoles);
  }

  [HttpPost]
  [Route("addRelationship")]
  [Authorize(Policy = "USER_ROLE_ADD")]
  public async Task<ObjectResult> AddRelationship([FromBody] UserRole userRole)
  {
    userRole = await userRoleService.AddRelationship(userRole);

    return Ok(userRole);
  }

  [HttpPost]
  [Route("removeRelationship")]
  [Authorize(Policy = "USER_ROLE_REMOVE")]
  public async Task<ObjectResult> RemoveRelationship([FromBody] UserRole userRole)
  {
    userRole = await userRoleService.RemoveRelationship(userRole);

    return Ok(userRole);
  }

  [HttpPost]
  [Route("activate")]
  [Authorize(Policy = "USER_ROLE_ACTIVATE")]
  public async Task<ObjectResult> Activate([FromBody] UserRole userRole)
  {
    await userRoleService.Activate(userRole);

    return Ok(true);
  }

  [HttpPost]
  [Route("deActivate")]
  [Authorize(Policy = "USER_ROLE_INACTIVATE")]
  public async Task<ObjectResult> DeActivate([FromBody] UserRole userRole)
  {
    await userRoleService.DeActivate(userRole);

    return Ok(true);
  }
}
