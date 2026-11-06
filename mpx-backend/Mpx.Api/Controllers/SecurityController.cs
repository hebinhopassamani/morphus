using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mpx.Application.Handlers;
using Mpx.Domain.Entities;
using Mpx.Domain.Security;
using Mpx.Infrastructure.Data;

namespace Mpx.Api.Controllers;

[ApiController]
[Route("api/v1/security")]
public class SecurityController(SecurityHandler securityHandler, MorphusDbContext dbContext) : ControllerBase
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
  [HttpPut("profile")]
  public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    var updatedUser = await securityHandler.UpdateProfileAsync(userId, request);
    if (updatedUser is null)
      return NotFound();

    return Ok(updatedUser);
  }

  [Authorize]
  [HttpGet("portal-preferences")]
  public async Task<IActionResult> GetPortalPreferences()
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    var items = new List<PortalPreferenceItem>();

    var corpUsers = await dbContext.Set<CorporationUser>()
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(cu => cu.UserId == userId)
        .ToListAsync();

    foreach (var cu in corpUsers)
    {
      items.Add(new PortalPreferenceItem
      {
        TargetType = "corporation",
        TargetId = cu.CorporationId,
        CorporationId = cu.CorporationId,
        Color = cu.Color,
        Favorite = cu.Favorite
      });
    }

    var wsUsers = await dbContext.Set<WorkspaceUser>()
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(wu => wu.UserId == userId)
        .ToListAsync();

    foreach (var wu in wsUsers)
    {
      items.Add(new PortalPreferenceItem
      {
        TargetType = "workspace",
        TargetId = wu.WorkspaceId,
        CorporationId = wu.CorporationId,
        WorkspaceId = wu.WorkspaceId,
        Color = wu.Color,
        Favorite = wu.Favorite
      });
    }

    var appUsers = await dbContext.Set<ApplicationUser>()
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(au => au.UserId == userId)
        .ToListAsync();

    foreach (var au in appUsers)
    {
      items.Add(new PortalPreferenceItem
      {
        TargetType = "application",
        TargetId = au.ApplicationId,
        CorporationId = au.CorporationId,
        WorkspaceId = au.WorkspaceId,
        Color = au.Color,
        Favorite = au.Favorite
      });
    }

    return Ok(items);
  }

  [Authorize]
  [HttpPost("portal-preferences")]
  public async Task<IActionResult> SavePortalPreference([FromBody] SavePortalPreferenceRequest request)
  {
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var corpIdClaim = User.FindFirst("corporation_id")?.Value;
    if (!Guid.TryParse(userIdClaim, out var userId))
      return Unauthorized();

    var corpId = request.CorporationId.HasValue && request.CorporationId.Value != Guid.Empty
        ? request.CorporationId.Value
        : (Guid.TryParse(corpIdClaim, out var parsedCorpId) ? parsedCorpId : Guid.Empty);

    var type = (request.TargetType ?? string.Empty).Trim().ToLowerInvariant();

    if (type == "corporation")
    {
      var targetCorpId = request.TargetId != Guid.Empty ? request.TargetId : corpId;
      var cu = await dbContext.Set<CorporationUser>()
          .IgnoreQueryFilters()
          .FirstOrDefaultAsync(x => x.CorporationId == targetCorpId && x.UserId == userId);

      if (cu is not null)
      {
        if (request.Color is not null)
          cu.Color = request.Color.Trim();
        if (request.Favorite.HasValue)
          cu.Favorite = request.Favorite.Value;

        await dbContext.SaveChangesAsync();
      }
    }
    else if (type == "workspace")
    {
      var wu = await dbContext.Set<WorkspaceUser>()
          .IgnoreQueryFilters()
          .FirstOrDefaultAsync(x => x.WorkspaceId == request.TargetId && x.UserId == userId);

      if (wu is null && corpId != Guid.Empty)
      {
        wu = new WorkspaceUser
        {
          CorporationId = corpId,
          WorkspaceId = request.TargetId,
          UserId = userId,
          Color = request.Color?.Trim(),
          Favorite = request.Favorite ?? false,
          IsOwner = false,
          Inactive = false,
          System = false
        };
        await dbContext.Set<WorkspaceUser>().AddAsync(wu);
      }
      else if (wu is not null)
      {
        if (request.Color is not null)
          wu.Color = request.Color.Trim();
        if (request.Favorite.HasValue)
          wu.Favorite = request.Favorite.Value;
      }

      await dbContext.SaveChangesAsync();
    }
    else if (type == "application")
    {
      var au = await dbContext.Set<ApplicationUser>()
          .IgnoreQueryFilters()
          .FirstOrDefaultAsync(x => x.ApplicationId == request.TargetId && x.UserId == userId);

      if (au is null && corpId != Guid.Empty)
      {
        au = new ApplicationUser
        {
          CorporationId = corpId,
          WorkspaceId = request.WorkspaceId,
          ApplicationId = request.TargetId,
          UserId = userId,
          Color = request.Color?.Trim(),
          Favorite = request.Favorite ?? false,
          IsOwner = false,
          Inactive = false,
          System = false
        };
        await dbContext.Set<ApplicationUser>().AddAsync(au);
      }
      else if (au is not null)
      {
        if (request.WorkspaceId.HasValue)
          au.WorkspaceId = request.WorkspaceId.Value;
        if (request.Color is not null)
          au.Color = request.Color.Trim();
        if (request.Favorite.HasValue)
          au.Favorite = request.Favorite.Value;
      }

      await dbContext.SaveChangesAsync();
    }

    return Ok(new { success = true });
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
