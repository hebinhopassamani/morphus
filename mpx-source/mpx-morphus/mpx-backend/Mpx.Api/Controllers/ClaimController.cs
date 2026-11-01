using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/claim")]
public class ClaimController(ClaimHandler claimHandler) : ControllerBase
{
  [HttpGet("{id:guid}")]
  [Authorize(Policy = "CLAIM_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await claimHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "CLAIM_LIST")]
  public async Task<IActionResult> GetList() =>
      Ok(await claimHandler.GetListAsync());

  [HttpPost]
  [Authorize(Policy = "CLAIM_CREATE")]
  public async Task<IActionResult> Create([FromBody] Claim claim) =>
      Ok(await claimHandler.CreateAsync(claim));

  [HttpPut]
  [Authorize(Policy = "CLAIM_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Claim claim) =>
      Ok(await claimHandler.UpdateAsync(claim));

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "CLAIM_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await claimHandler.DeleteAsync(id);
    return NoContent();
  }
}

