using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Application.MorphusController;
using Mpx.Application.Validators;
using Mpx.Domain.Entities;

namespace Mpx.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/corporation")]
public class CorporationController(
    ICorporationValidator mpsValidator,
    CorporationHandler corporationHandler,
    IHttpContextAccessor httpContext)
    : MorphusController<Corporation>(httpContext)
{
  private readonly ICorporationValidator validator = mpsValidator;

  [HttpGet("{id:guid}")]
  [Authorize(Policy = "CORPORATION_GET_BY_ID")]
  public async Task<IActionResult> GetById(Guid id) =>
      Ok(await corporationHandler.GetByIdAsync(id));

  [HttpGet]
  [Authorize(Policy = "CORPORATION_LIST")]
  public async Task<IActionResult> GetList()
  {
    if (CorporationId is null || CorporationId == Guid.Empty)
      return Unauthorized();

    return Ok(await corporationHandler.GetListAsync(CorporationId.Value));
  }

  [HttpPost]
  [Authorize(Policy = "CORPORATION_CREATE")]
  public async Task<IActionResult> Create([FromBody] Corporation corporation)
  {
    if (CorporationId is null || CorporationId == Guid.Empty)
      return Unauthorized();

    await validator.ValidateCorporation(corporation);

    if (validator.IsValid())
    {
      var result = await corporationHandler.CreateBranchAsync(corporation, CorporationId.Value, UserId);
      return Ok(result);
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }

  [HttpPut]
  [HttpPut("{id:guid}")]
  [Authorize(Policy = "CORPORATION_UPDATE")]
  public async Task<IActionResult> Update([FromBody] Corporation corporation, Guid? id = null)
  {
    if (id.HasValue && corporation.Id == Guid.Empty)
      corporation.Id = id.Value;

    await validator.ValidateCorporation(corporation);

    if (validator.IsValid())
    {
      var result = await corporationHandler.UpdateAsync(corporation);
      return Ok(result);
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Policy = "CORPORATION_DELETE")]
  public async Task<IActionResult> Delete(Guid id)
  {
    await validator.ValidateDeleteCorporation(id);

    if (validator.IsValid())
    {
      await corporationHandler.DeleteAsync(id);
      return NoContent();
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }
}
