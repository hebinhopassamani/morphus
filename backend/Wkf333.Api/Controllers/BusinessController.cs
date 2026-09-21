using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.BusinessService;
using Morphus.Application.Services.security;
using Morphus.Application.Validators;
using Morphus.Domain.Dtos.Account;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/business")]
public class BusinessController(ISecurityValidator mpsValidator,
                                IBusinessService mpsBusinessService,
                                ISecurityService mpsSecurityService,
                                IHttpContextAccessor httpContext) : MorphusController<Business>(httpContext)
{
  private readonly ISecurityValidator validator = mpsValidator;
  private readonly IBusinessService businessService = mpsBusinessService;
  private readonly ISecurityService securityService = mpsSecurityService;

  [HttpPost]
  [Route("list")]
  [Authorize(Policy = "BUSINESS_LIST")]
  public async Task<ObjectResult> GetByList([FromBody] MorphusFilter? filter)
  {
    var business = await businessService.GetList(filter);

    return Ok(business);
  }

  [HttpGet]
  [Route("{id}")]
  [Authorize(Policy = "BUSINESS_GET_BY_ID")]
  public async Task<ObjectResult> GetAccount(Guid id)
  {
    var account = await securityService.GetAccount(id);

    return Ok(account);
  }

  [HttpPost]
  [Route("createAccount")]
  [Authorize(Policy = "BUSINESS_CREATE")]
  public async Task<IActionResult> CreateAccount([FromBody] AccountDTO account)
  {
    await validator.ValidateAccount(account);

    if (validator.IsValid())
    {
      var result = await securityService.CreateAccount(account);

      return Ok(result);
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }

  [HttpPut]
  [Route("updateAccount")]
  [Authorize(Policy = "BUSINESS_UPDATE")]
  public async Task<IActionResult> UpdateAccount([FromBody] AccountDTO account)
  {
    await validator.ValidateAccount(account);

    if (validator.IsValid())
    {
      var result = await securityService.UpdateAccount(account);

      return Ok(result);
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }

  [HttpDelete()]
  [Route("delete/{id}")]
  [Authorize(Policy = "BUSINESS_DELETE")]
  public async Task<ObjectResult> Delete(Guid id)
  {
    var result = await businessService.Delete(id);

    return Ok(result);
  }
}
