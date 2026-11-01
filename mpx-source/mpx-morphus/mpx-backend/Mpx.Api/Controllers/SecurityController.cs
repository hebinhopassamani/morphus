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
      var origin = Request.Headers.Origin.FirstOrDefault() ?? "https://morphus.me";
      var session = await securityHandler.CreateAccountAndLoginAsync(request, origin);
      return Ok(session);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { message = ex.Message });
    }
  }

  [AllowAnonymous]
  [HttpPost("confirm-email")]
  public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
  {
    var success = await securityHandler.ConfirmEmailAsync(request);
    if (!success)
      return BadRequest(new { message = "Link de confirmação inválido ou expirado." });

    return Ok(new { message = "E-mail confirmado com sucesso!" });
  }

  [Authorize]
  [HttpPost("onboarding/resend-confirmation")]
  public async Task<IActionResult> ResendConfirmationEmail()
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    var origin = Request.Headers.Origin.FirstOrDefault() ?? "https://morphus.me";
    var sent = await securityHandler.ResendConfirmationEmailAsync(userId, origin);
    if (!sent)
      return BadRequest(new { message = "Não foi possível reenviar o e-mail de confirmação." });

    return Ok(new { message = "E-mail de confirmação reenviado com sucesso." });
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

    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    Guid? corporationId = Guid.TryParse(corpIdClaim, out var parsedCorpId) ? parsedCorpId : null;

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
  [HttpGet("onboarding/state")]
  public async Task<IActionResult> GetOnboardingState()
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    var state = await securityHandler.GetOnboardingStateAsync(userId);
    if (state is null)
      return NotFound();

    return Ok(state);
  }

  [Authorize]
  [HttpPost("onboarding/step-corporation")]
  public async Task<IActionResult> SaveOnboardingCorporationStep([FromBody] OnboardingCorporationStepRequest request)
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    try
    {
      var session = await securityHandler.SaveOnboardingCorporationStepAsync(userId, request);
      if (session is null)
        return Unauthorized();

      return Ok(session);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { message = ex.Message });
    }
  }

  [Authorize]
  [HttpPost("onboarding/step-workspace")]
  public async Task<IActionResult> SaveOnboardingWorkspaceStep([FromBody] OnboardingWorkspaceStepRequest request)
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    try
    {
      var state = await securityHandler.SaveOnboardingWorkspaceStepAsync(userId, request);
      if (state is null)
        return Unauthorized();

      return Ok(state);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { message = ex.Message });
    }
  }

  [Authorize]
  [HttpPost("onboarding/complete")]
  public async Task<IActionResult> CompleteOnboarding([FromBody] OnboardingCompleteRequest request)
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    try
    {
      var session = await securityHandler.CompleteOnboardingAsync(userId, request);
      if (session is null)
        return Unauthorized();

      return Ok(session);
    }
    catch (InvalidOperationException ex)
    {
      return BadRequest(new { message = ex.Message });
    }
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
