using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.BusinessUserService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/businesUser")]
public class BusinessUserController(IBusinessUserService mpsBusinessService, IHttpContextAccessor httpContext) : MorphusController<BusinessUser>(httpContext)
{
  private readonly IBusinessUserService businessUserService = mpsBusinessService;

  [HttpGet]
  [Route("users/{businessId}")]
  [Authorize(Policy = "BUSINESS_USERS_LIST")]
  public async Task<ObjectResult> GetEntitiesToRelate(Guid businessId)
  {
    var users = await businessUserService.GetEntitiesToRelate(businessId);

    return Ok(users);
  }

  [HttpGet]
  [Route("{businessId}")]
  [Authorize(Policy = "BUSINESS_USERS_LIST")]
  public async Task<ObjectResult> GetRelatedEntities(Guid businessId)
  {
    var businessUsers = await businessUserService.GetRelatedEntities(businessId);

    return Ok(businessUsers);
  }

  [HttpPost]
  [Route("addRelationship")]
  [Authorize(Policy = "BUSINESS_USER_ADD")]
  public async Task<ObjectResult> AddRelationship([FromBody] BusinessUser businessUser)
  {
    businessUser = await businessUserService.AddRelationship(businessUser);

    return Ok(businessUser);
  }

  [HttpPost]
  [Route("removeRelationship")]
  [Authorize(Policy = "BUSINESS_USER_REMOVE")]
  public async Task<ObjectResult> RemoveRelationship([FromBody] BusinessUser businessUser)
  {
    businessUser = await businessUserService.RemoveRelationship(businessUser);

    return Ok(businessUser);
  }

  [HttpPost]
  [Route("activate")]
  [Authorize(Policy = "BUSINESS_USER_ACTIVATE")]
  public async Task<ObjectResult> Activate([FromBody] BusinessUser businessUser)
  {
    await businessUserService.Activate(businessUser);

    return Ok(true);
  }

  [HttpPost]
  [Route("deActivate")]
  [Authorize(Policy = "BUSINESS_USER_INACTIVATE")]
  public async Task<ObjectResult> DeActivate([FromBody] BusinessUser businessUser)
  {
    await businessUserService.DeActivate(businessUser);

    return Ok(true);
  }

  [HttpPost]
  [Route("setOwner")]
  [Authorize(Policy = "BUSINESS_USER_SET_OWNER")]
  public async Task<ObjectResult> SetOwner([FromBody] BusinessUser businessUser)
  {
    await businessUserService.SetOwner(businessUser);

    return Ok(true);
  }

  [HttpPost]
  [Route("removeOwner")]
  [Authorize(Policy = "BUSINESS_USER_REMOVE_OWNER")]
  public async Task<ObjectResult> RemoveOwner([FromBody] BusinessUser businessUser)
  {
    await businessUserService.RemoveOwner(businessUser);

    return Ok(true);
  }
}
