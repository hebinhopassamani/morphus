using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/corporation-user")]
public class CorporationUserController(CorporationUserHandler corporationUserHandler) : ControllerBase
{
  [HttpGet("entities-to-relate/{corporationId:guid}")]
  [Authorize(Policy = "CORPORATION_USER_LIST")]
  public async Task<IActionResult> GetEntitiesToRelate(Guid corporationId) =>
      Ok(await corporationUserHandler.GetEntitiesToRelateAsync(corporationId));

  [HttpGet("related-entities/{corporationId:guid}")]
  [Authorize(Policy = "CORPORATION_USER_LIST")]
  public async Task<IActionResult> GetRelatedEntities(Guid corporationId) =>
      Ok(await corporationUserHandler.GetRelatedEntitiesAsync(corporationId));

  [HttpPost("add-relationship")]
  [Authorize(Policy = "CORPORATION_USER_ADD")]
  public async Task<IActionResult> AddRelationship([FromBody] CorporationUser corporationUser) =>
      Ok(await corporationUserHandler.AddRelationshipAsync(corporationUser));

  [HttpPost("remove-relationship")]
  [Authorize(Policy = "CORPORATION_USER_REMOVE")]
  public async Task<IActionResult> RemoveRelationship([FromBody] CorporationUser corporationUser) =>
      Ok(await corporationUserHandler.RemoveRelationshipAsync(corporationUser));

  [HttpPost("activate")]
  [Authorize(Policy = "CORPORATION_USER_ACTIVATE")]
  public async Task<IActionResult> Activate([FromBody] CorporationUser corporationUser)
  {
    await corporationUserHandler.ActivateAsync(corporationUser);
    return Ok(true);
  }

  [HttpPost("deactivate")]
  [Authorize(Policy = "CORPORATION_USER_INACTIVATE")]
  public async Task<IActionResult> Deactivate([FromBody] CorporationUser corporationUser)
  {
    await corporationUserHandler.DeactivateAsync(corporationUser);
    return Ok(true);
  }

  [HttpPost("set-owner")]
  [Authorize(Policy = "CORPORATION_USER_SET_OWNER")]
  public async Task<IActionResult> SetOwner([FromBody] CorporationUser corporationUser)
  {
    await corporationUserHandler.SetOwnerAsync(corporationUser, true);
    return Ok(true);
  }

  [HttpPost("remove-owner")]
  [Authorize(Policy = "CORPORATION_USER_REMOVE_OWNER")]
  public async Task<IActionResult> RemoveOwner([FromBody] CorporationUser corporationUser)
  {
    await corporationUserHandler.SetOwnerAsync(corporationUser, false);
    return Ok(true);
  }
}

