using Microsoft.AspNetCore.Mvc;
using Morphus.Domain.Entities.Models;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.security;
using Morphus.Application.Validators;
using Morphus.Domain.Entities.Security;
using Morphus.Domain.Dtos.Account;

namespace Morphus.Api.Controllers;

[ApiController]
[Route("api/security")]
public class SecurityController(ISecurityValidator mpsValidator,
                                ISecurityService mpsSecurityService,
                                IHttpContextAccessor httpContext) : MorphusController<User>(httpContext)
{
  private readonly ISecurityValidator validator = mpsValidator;
  private readonly ISecurityService securityService = mpsSecurityService;

  [HttpPost]
  [Route("login")]
  public async Task<ObjectResult> Login(Login login)
  {
    var session = await securityService.Login(login);

    if (session is null)
    {
      return Ok(null);
    }

    return Ok(session);
  }

  [HttpPost]
  [Route("refreshToken")]
  public async Task<ObjectResult> RefreshRoken(Login login)
  {
    var session = await securityService.RefreshToken(login);

    if (session is null)
    {
      return Ok(null);
    }

    return Ok(session);
  }

  [HttpPost]
  [Route("createAccount")]
  public async Task<IActionResult> CreateAccount(AccountDTO account)
  {
    await validator.ValidateAccount(account);

    if (validator.IsValid())
    {
      var result = await securityService.CreateAccountAndLogin(account);

      return Ok(result);
    }

    return MorphusErrorMessage(validator.ErrorMessage);
  }

  [HttpGet]
  [Route("revoke/{email}")]
  public async Task<IActionResult> Revoke(string email)
  {
    await securityService.Revoke(email);

    return NoContent();
  }
}
