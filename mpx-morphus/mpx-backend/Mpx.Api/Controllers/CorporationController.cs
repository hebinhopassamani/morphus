using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/corporation")]
public class CorporationController(CorporationHandler corporationHandler) : ControllerBase
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "CORPORATION_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await corporationHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "CORPORATION_LIST")]
  public async Task<IActionResult> GetList()
  {
    var corpIdClaim = User.FindFirst("corporation_id")?.Value;
    if (!Guid.TryParse(corpIdClaim, out var corporationId))
      return Unauthorized();

    return Ok(await corporationHandler.GetListAsync(corporationId));
  }

  [HttpPost]
  [Authorize(Policy = "CORPORATION_CREATE")]
  public async Task<IActionResult> Create([FromBody] Corporation corporation)
  {
    var corpIdClaim = User.FindFirst("corporation_id")?.Value;
    if (!Guid.TryParse(corpIdClaim, out var corporationId))
      return Unauthorized();

    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    Guid? creatorUserId = Guid.TryParse(userIdClaim, out var parsedUserId) ? parsedUserId : null;

    return Ok(await corporationHandler.CreateBranchAsync(corporation, corporationId, creatorUserId));
  }

  [HttpPut]
  [Authorize(Policy = "CORPORATION_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Corporation corporation) =>
      Ok(await corporationHandler.UpdateAsync(corporation));

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "CORPORATION_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await corporationHandler.DeleteAsync(id);
    return NoContent();
  }
}

