using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Domain.Entities.Models;
using Morphus.Application.MorphusController;
using Morphus.Domain.Filters;
using Morphus.Application.Services.ClaimService;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/claim")]
public class ClaimController(IClaimService mpsClaimService, IHttpContextAccessor httpContext) : MorphusController<Claim>(httpContext)
{
  private readonly IClaimService claimService = mpsClaimService;

  [HttpGet]
  [Route("{id}")]
  [Authorize(Policy = "CLAIM_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id)
  {
    var claim = await claimService.GetById(id);

    return Ok(claim);
  }

  [HttpPost]
  [Route("list")]
  [Authorize(Policy = "CLAIM_LIST")]
  public async Task<ObjectResult> GetList([FromBody] MorphusFilter? filter)
  {
    var claims = await claimService.GetList(filter);

    return Ok(claims);
  }

  [HttpPost]
  [Route("create")]
  [Authorize(Policy = "CLAIM_CREATE")]
  public async Task<ObjectResult> Create([FromBody] Claim claim)
  {
    claim = await claimService.Create(claim);

    return Ok(claim);
  }

  [HttpPut]
  [Route("update")]
  [Authorize(Policy = "CLAIM_UPDATE")]
  public async Task<ObjectResult> Update([FromBody] Claim claim)
  {
    claim = await claimService.Update(claim);

    return Ok(claim);
  }

  [HttpDelete()]
  [Route("delete/{id}")]
  [Authorize(Policy = "CLAIM_DELETE")]
  public async Task<ObjectResult> Delete(Guid id)
  {
    var result = await claimService.Delete(id);

    return Ok(result);
  }
}
