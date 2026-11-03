using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/application-user")]
public class ApplicationUserController(ApplicationUserHandler applicationUserHandler) : ControllerBase
{
  [HttpGet("entities-to-relate/{applicationId:guid}")]
  [Authorize(Policy = "APPLICATION_USER_LIST")]
  public async Task<IActionResult> GetEntitiesToRelate(Guid applicationId) =>
      Ok(await applicationUserHandler.GetEntitiesToRelateAsync(applicationId));

  [HttpGet("related-entities/{applicationId:guid}")]
  [Authorize(Policy = "APPLICATION_USER_LIST")]
  public async Task<IActionResult> GetRelatedEntities(Guid applicationId) =>
      Ok(await applicationUserHandler.GetRelatedEntitiesAsync(applicationId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "APPLICATION_USER_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] ApplicationUser applicationUser) =>
      Ok(await applicationUserHandler.AddRelationshipAsync(applicationUser));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "APPLICATION_USER_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] ApplicationUser applicationUser) =>
      Ok(await applicationUserHandler.RemoveRelationshipAsync(applicationUser));

  [HttpPost("activate")]
  [Authorize(Policy = "APPLICATION_USER_ACTIVATE")]
  public async Task<IActionResult> Activate([FromBody] ApplicationUser applicationUser)
  {
    await applicationUserHandler.ActivateAsync(applicationUser);
    return Ok(true);
  }

  [HttpPost("deactivate")]
  [Authorize(Policy = "APPLICATION_USER_INACTIVATE")]
  public async Task<IActionResult> Deactivate([FromBody] ApplicationUser applicationUser)
  {
    await applicationUserHandler.DeactivateAsync(applicationUser);
    return Ok(true);
  }

  [HttpPost("set-owner")]
  [Authorize(Policy = "APPLICATION_USER_SET_OWNER")]
  public async Task<IActionResult> SetOwner([FromBody] ApplicationUser applicationUser)
  {
    await applicationUserHandler.SetOwnerAsync(applicationUser, true);
    return Ok(true);
  }

  [HttpPost("remove-owner")]
  [Authorize(Policy = "APPLICATION_USER_REMOVE_OWNER")]
  public async Task<IActionResult> RemoveOwner([FromBody] ApplicationUser applicationUser)
  {
    await applicationUserHandler.SetOwnerAsync(applicationUser, false);
    return Ok(true);
  }
}
