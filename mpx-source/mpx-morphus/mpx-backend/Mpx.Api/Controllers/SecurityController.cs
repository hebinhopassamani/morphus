using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mpx.Application.Handlers;
using Mpx.Domain.Security;

namespace Mpx.Api.Controllers;

[ApiController]
[Route("api/v1/security")]
public class SecurityController(SecurityHandler securityHandler) : ControllerBase
{
  [AllowAnonymous]
  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginRequest request)
  {
    var session = await securityHandler.LoginAsync(request);
    if (session is null)
      return Unauthorized(new { message = "E-mail ou senha inválidos." });

    return Ok(session);
  }

  [AllowAnonymous]
  [HttpPost("google-login")]
  public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
  {
    var session = await securityHandler.LoginWithGoogleAsync(request);
    if (session is null)
      return Unauthorized(new { message = "Não encontramos uma conta ativa vinculada a este e-mail do Google." });

    return Ok(session);
  }

  [AllowAnonymous]
  [HttpPost("refresh-token")]
  public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
  {
    var session = await securityHandler.RefreshTokenAsync(request);
    if (session is null)
      return Unauthorized(new { message = "Sessão expirada. Faça login novamente." });

    return Ok(session);
  }

  [AllowAnonymous]
  [HttpPost("create-account")]
  public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
  {
    try
    {
      var session = await securityHandler.CreateAccountAndLoginAsync(request);
      return Ok(session);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { message = ex.Message });
    }
  }

  [AllowAnonymous]
  [HttpPost("forgot-password")]
  public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
  {
    var origin = Request.Headers.Origin.FirstOrDefault() ?? "https://morphus.me";
    await securityHandler.RequestPasswordResetAsync(request, origin);
    return Ok(new { message = "Se o e-mail estiver cadastrado, enviamos o link de recuperação." });
  }

  [AllowAnonymous]
  [HttpPost("reset-password")]
  public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
  {
    var success = await securityHandler.ResetPasswordAsync(request);
    if (!success)
      return BadRequest(new { message = "Token de recuperação inválido ou expirado." });

    return Ok(new { message = "Senha redefinida com sucesso." });
  }

  [Authorize]
  [HttpPost("refresh-session")]
  public async Task<IActionResult> RefreshSession()
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var corpIdClaim = User.FindFirst("corporation_id")?.Value;

    if (!Guid.TryParse(userIdClaim, out var userId) || !Guid.TryParse(corpIdClaim, out var corporationId))
      return Unauthorized();

    var session = await securityHandler.RefreshSessionOrSwitchCorporationAsync(userId, corporationId);
    if (session is null)
      return Unauthorized();

    return Ok(session);
  }

  [Authorize]
  [HttpPost("switch-corporation")]
  public async Task<IActionResult> SwitchCorporation([FromBody] SwitchCorporationRequest request)
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    var session = await securityHandler.RefreshSessionOrSwitchCorporationAsync(userId, request.CorporationId);
    if (session is null)
      return Forbid();

    return Ok(session);
  }

  [Authorize]
  [HttpPost("revoke")]
  public async Task<IActionResult> Revoke()
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    await securityHandler.RevokeAsync(userId);
    return NoContent();
  }
}
