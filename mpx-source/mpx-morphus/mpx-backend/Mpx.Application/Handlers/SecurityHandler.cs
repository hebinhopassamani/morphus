using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;

namespace Mpx.Application.Handlers;

public class SecurityHandler(
    IUserRepository userRepository,
    ICorporationRepository corporationRepository,
    EmailHandler emailHandler,
    IUnitOfWork unitOfWork,
    IConfiguration configuration)
{
  private static readonly HttpClient GoogleHttpClient = new();

  private sealed class GoogleUserInfoResponse
  {
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("email_verified")]
    public bool EmailVerified { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("picture")]
    public string? Picture { get; set; }
  }

  public async Task<MorphusSession?> LoginWithGoogleAsync(GoogleLoginRequest request)
  {
    GoogleUserInfoResponse? googleUser = null;

    if (!string.IsNullOrWhiteSpace(request.AccessToken))
    {
      using var httpRequest = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
      httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", request.AccessToken);

      using var response = await GoogleHttpClient.SendAsync(httpRequest);
      if (!response.IsSuccessStatusCode)
        return null;

      googleUser = await response.Content.ReadFromJsonAsync<GoogleUserInfoResponse>();
    }
    else if (!string.IsNullOrWhiteSpace(request.IdToken))
    {
      using var response = await GoogleHttpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(request.IdToken)}");
      if (!response.IsSuccessStatusCode)
        return null;

      googleUser = await response.Content.ReadFromJsonAsync<GoogleUserInfoResponse>();
    }

    if (googleUser is null || string.IsNullOrWhiteSpace(googleUser.Email))
      return null;

    var email = googleUser.Email.Trim().ToLowerInvariant();
    var user = await userRepository.GetByLoginAsync(email);
    if (user is null)
    {
      var displayName = !string.IsNullOrWhiteSpace(googleUser.Name)
          ? googleUser.Name.Trim()
          : email.Split('@')[0];

      var createRequest = new CreateAccountRequest
      {
        CorporationName = displayName,
        CorporationFullName = displayName,
        CorporationEmail = email,
        AdminName = displayName,
        AdminEmail = email,
        AdminPassword = MorphusSecurity.GenerateSecureToken()
      };

      using var transaction = await unitOfWork.BeginTransactionAsync();
      try
      {
        var (newCorporation, newAdminUser) = MorphusAccountSeed.CreateInitialAccountGraph(createRequest);
        newAdminUser.Picture = googleUser.Picture;
        newAdminUser.EmailConfirmed = true;

        await corporationRepository.AddAsync(newCorporation);
        await transaction.Commit();

        try
        {
          await emailHandler
              .NewEmail(newCorporation.Id)
              .Subject("Bem-vindo ao Morphus")
              .LoadHtmlFile("welcome")
              .SetVariable("{{Nome}}", displayName)
              .SetVariable("{{Empresa}}", displayName)
              .MailTo(email, displayName)
              .SendEmailAsync();
        }
        catch
        {
          // Não impede o login caso o servidor SMTP externo esteja temporariamente indisponível
        }
      }
      catch
      {
        await transaction.Rollback();
        throw;
      }

      user = await userRepository.GetByLoginAsync(email);
      if (user is null)
        return null;
    }

    if (!string.IsNullOrWhiteSpace(googleUser.Picture) && user.Picture != googleUser.Picture)
    {
      user.Picture = googleUser.Picture;
    }

    if (googleUser.EmailVerified && !user.EmailConfirmed)
    {
      user.EmailConfirmed = true;
    }

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    if (activeCorporationUsers.Count == 0)
      return null;

    Corporation? selectedCorporation = null;

    if (request.CorporationId is not null && request.CorporationId != Guid.Empty)
    {
      selectedCorporation = activeCorporationUsers
          .FirstOrDefault(cu => cu.CorporationId == request.CorporationId)?.Corporation;
    }

    selectedCorporation ??= activeCorporationUsers
        .FirstOrDefault(cu => cu.CorporationId == user.CorporationId)?.Corporation
        ?? activeCorporationUsers[0].Corporation;

    if (selectedCorporation is null)
      return null;

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }
  public async Task<MorphusSession?> LoginAsync(LoginRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
      return null;

    var user = await userRepository.GetByLoginAsync(request.Email);
    if (user is null || string.IsNullOrWhiteSpace(user.PasswordHash))
      return null;

    if (!MorphusSecurity.VerifyPassword(request.Password, user.PasswordHash))
      return null;

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    if (activeCorporationUsers.Count == 0)
      return null;

    Corporation? selectedCorporation = null;

    if (request.CorporationId is not null && request.CorporationId != Guid.Empty)
    {
      selectedCorporation = activeCorporationUsers
          .FirstOrDefault(cu => cu.CorporationId == request.CorporationId)?.Corporation;
    }

    selectedCorporation ??= activeCorporationUsers
        .FirstOrDefault(cu => cu.CorporationId == user.CorporationId)?.Corporation
        ?? activeCorporationUsers[0].Corporation;

    if (selectedCorporation is null)
      return null;

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<MorphusSession?> RefreshTokenAsync(RefreshTokenRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.RefreshToken))
      return null;

    var user = await userRepository.GetByRefreshTokenAsync(request.RefreshToken);
    if (user is null)
      return null;

    if (user.RefreshTokenExpiration is null || user.RefreshTokenExpiration < DateTime.UtcNow)
      return null;

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    if (activeCorporationUsers.Count == 0)
      return null;

    Corporation? selectedCorporation = null;

    if (request.CorporationId is not null && request.CorporationId != Guid.Empty)
    {
      selectedCorporation = activeCorporationUsers
          .FirstOrDefault(cu => cu.CorporationId == request.CorporationId)?.Corporation;
    }

    selectedCorporation ??= activeCorporationUsers
        .FirstOrDefault(cu => cu.CorporationId == user.CorporationId)?.Corporation
        ?? activeCorporationUsers[0].Corporation;

    if (selectedCorporation is null)
      return null;

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<MorphusSession?> RefreshSessionOrSwitchCorporationAsync(Guid userId, Guid targetCorporationId)
  {
    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return null;

    var activeCorporationUsers = user.CorporationUsers
        .Where(cu => !cu.Inactive && cu.Corporation is not null)
        .ToList();

    var selectedCorporation = activeCorporationUsers
        .FirstOrDefault(cu => cu.CorporationId == targetCorporationId)?.Corporation;

    if (selectedCorporation is null)
      return null;

    var session = BuildAuthorizedSession(user, selectedCorporation, activeCorporationUsers);

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    return session;
  }

  public async Task<MorphusSession?> CreateAccountAndLoginAsync(CreateAccountRequest request)
  {
    if (await userRepository.ExistsEmailAsync(request.AdminEmail))
    {
      throw new InvalidOperationException("Já existe um usuário cadastrado com este e-mail.");
    }

    using var transaction = await unitOfWork.BeginTransactionAsync();

    Corporation corporation;
    try
    {
      var seedResult = MorphusAccountSeed.CreateInitialAccountGraph(request);
      corporation = seedResult.Corporation;

      await corporationRepository.AddAsync(corporation);
      await transaction.Commit();
    }
    catch
    {
      await transaction.Rollback();
      throw;
    }

    // Dispara o e-mail de boas-vindas usando o EmailHandler (Outbox Pattern + SMTP)
    try
    {
      await emailHandler
          .NewEmail(corporation.Id)
          .Subject("Bem-vindo ao Morphus")
          .LoadHtmlFile("welcome")
          .SetVariable("{{Nome}}", request.AdminName)
          .SetVariable("{{Empresa}}", request.CorporationName)
          .MailTo(request.AdminEmail, request.AdminName)
          .SendEmailAsync();
    }
    catch
    {
      // Não impede o login caso o servidor SMTP externo esteja temporariamente indisponível
    }

    return await LoginAsync(new LoginRequest
    {
      Email = request.AdminEmail,
      Password = request.AdminPassword,
      CorporationId = corporation.Id
    });
  }

  public async Task RequestPasswordResetAsync(ForgotPasswordRequest request, string frontendBaseUrl)
  {
    if (string.IsNullOrWhiteSpace(request.Email))
      return;

    var user = await userRepository.GetByLoginAsync(request.Email);
    if (user is null || string.IsNullOrWhiteSpace(user.Email))
      return;

    var resetToken = MorphusSecurity.GenerateSecureToken();
    user.SecurityStamp = resetToken;

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();

    var encodedEmail = Uri.EscapeDataString(user.Email);
    var encodedToken = Uri.EscapeDataString(resetToken);
    var resetLink = $"{frontendBaseUrl.TrimEnd('/')}/security/reset-password?email={encodedEmail}&token={encodedToken}";

    await emailHandler
        .NewEmail(user.CorporationId)
        .Subject("Recuperação de Senha - Morphus")
        .LoadHtmlFile("password-reset")
        .SetVariable("{{Nome}}", user.Name ?? user.Email)
        .SetVariable("{{LinkRecuperacao}}", resetLink)
        .MailTo(user.Email, user.Name)
        .SendEmailAsync();
  }

  public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Token) ||
        string.IsNullOrWhiteSpace(request.NewPassword))
    {
      return false;
    }

    var user = await userRepository.GetByLoginAsync(request.Email);
    if (user is null || string.IsNullOrWhiteSpace(user.SecurityStamp))
      return false;

    var expectedBytes = Encoding.UTF8.GetBytes(user.SecurityStamp);
    var providedBytes = Encoding.UTF8.GetBytes(request.Token);

    if (!CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes))
      return false;

    user.PasswordHash = MorphusSecurity.HashPassword(request.NewPassword);
    user.SecurityStamp = MorphusSecurity.GenerateSecureToken();
    user.RefreshToken = null;
    user.RefreshTokenExpiration = null;

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();
    return true;
  }

  public async Task<bool> RevokeAsync(Guid userId)
  {
    var user = await userRepository.GetByIdWithAccessAsync(userId);
    if (user is null)
      return false;

    user.RefreshToken = null;
    user.RefreshTokenExpiration = null;
    user.SecurityStamp = null;

    userRepository.Update(user);
    await unitOfWork.SaveChangesAsync();
    return true;
  }

  private MorphusSession BuildAuthorizedSession(
      User user,
      Corporation activeCorporation,
      List<CorporationUser> activeCorporationUsers)
  {
    var nowUtc = DateTime.UtcNow;

    var accessTokenMinutes = int.TryParse(configuration["JWT:AccessTokenExpires"], out var atm) ? atm : 60;
    var refreshTokenMinutes = int.TryParse(configuration["JWT:RefreshTokenExpires"], out var rtm) ? rtm : 1440;

    var accessExpiresUtc = nowUtc.AddMinutes(accessTokenMinutes);
    var refreshExpiresUtc = nowUtc.AddMinutes(refreshTokenMinutes);

    var claims = BuildClaims(user, activeCorporation);
    var jwtString = GenerateJwtToken(claims, nowUtc, accessExpiresUtc);

    var newRefreshToken = MorphusSecurity.GenerateSecureToken();
    user.RefreshToken = newRefreshToken;
    user.RefreshTokenExpiration = refreshExpiresUtc;
    user.SecurityStamp = MorphusSecurity.GenerateSecureToken();

    return new MorphusSession
    {
      User = new User
      {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Inactive = user.Inactive,
        EmailConfirmed = user.EmailConfirmed,
        PhoneConfirmed = user.PhoneConfirmed,
        TermsConfirmed = user.TermsConfirmed,
        System = user.System,
        UserStatusId = user.UserStatusId,
        CorporationId = user.CorporationId,
        NickName = user.NickName,
        Picture = user.Picture,
        PhoneNumber = user.PhoneNumber,
        Website = user.Website,
        Gender = user.Gender,
        Birthdate = user.Birthdate
      },
      Corporation = new Corporation
      {
        Id = activeCorporation.Id,
        Name = activeCorporation.Name,
        FullName = activeCorporation.FullName,
        Icon = activeCorporation.Icon,
        Key = activeCorporation.Key,
        Email = activeCorporation.Email,
        System = activeCorporation.System,
        CorporationId = activeCorporation.CorporationId,
        Description = activeCorporation.Description
      },
      AccessToken = new AccessTokenInfo
      {
        Value = jwtString,
        CreationDate = nowUtc,
        ExpirationDate = accessExpiresUtc,
        ExpirationTime = new DateTimeOffset(accessExpiresUtc).ToUnixTimeSeconds()
      },
      RefreshToken = new RefreshTokenInfo
      {
        Value = newRefreshToken,
        CreationDate = nowUtc,
        ExpirationDate = refreshExpiresUtc,
        ExpirationTime = new DateTimeOffset(refreshExpiresUtc).ToUnixTimeSeconds()
      },
      AvailableCorporations = activeCorporationUsers
          .Where(cu => cu.Corporation is not null)
          .Select(cu => new CorporationSummary
          {
            Id = cu.Corporation!.Id,
            Name = cu.Corporation.Name,
            Key = cu.Corporation.Key,
            Icon = cu.Corporation.Icon,
            Description = cu.Corporation.Description,
            ParentCorporationId = cu.Corporation.CorporationId,
            IsOwner = cu.IsOwner
          })
          .ToList()
    };
  }

  private string GenerateJwtToken(
      IEnumerable<System.Security.Claims.Claim> claims,
      DateTime createdAtUtc,
      DateTime expiresAtUtc)
  {
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? configuration["JWT:SecretKey"]
        ?? throw new InvalidOperationException("Chave secreta JWT não configurada.");

    var keyBytes = Encoding.UTF8.GetBytes(secretKey);
    var signingCredentials = new SigningCredentials(
        new SymmetricSecurityKey(keyBytes),
        SecurityAlgorithms.HmacSha256Signature);

    var descriptor = new SecurityTokenDescriptor
    {
      Subject = new ClaimsIdentity(claims),
      NotBefore = createdAtUtc,
      Expires = expiresAtUtc,
      Issuer = configuration["JWT:ValidIssuer"] ?? "https://morphus.me",
      Audience = configuration["JWT:ValidAudience"] ?? "https://morphus.me",
      SigningCredentials = signingCredentials
    };

    var tokenHandler = new JsonWebTokenHandler();
    return tokenHandler.CreateToken(descriptor);
  }

  private static List<System.Security.Claims.Claim> BuildClaims(User user, Corporation activeCorporation)
  {
    var authClaims = new List<System.Security.Claims.Claim>
    {
      new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
      new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
      new(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new("corporation_id", activeCorporation.Id.ToString())
    };

    if (!string.IsNullOrWhiteSpace(user.Email))
      authClaims.Add(new(ClaimTypes.Email, user.Email));

    if (!string.IsNullOrWhiteSpace(user.Name))
      authClaims.Add(new(ClaimTypes.Name, user.Name));

    // 1. Claims atribuídas diretamente ao usuário na Corporação/Filial ativa
    foreach (var uc in user.UserClaims.Where(uc => !uc.Inactive && uc.CorporationId == activeCorporation.Id))
    {
      if (uc.Claim is not null && !string.IsNullOrWhiteSpace(uc.Claim.ClaimType) && !string.IsNullOrWhiteSpace(uc.Claim.ClaimValue))
      {
        if (!authClaims.Any(c => c.Type == uc.Claim.ClaimType && c.Value == uc.Claim.ClaimValue))
        {
          authClaims.Add(new(uc.Claim.ClaimType, uc.Claim.ClaimValue));
        }
      }
    }

    // 2. Roles e Claims herdadas dos Perfis (Roles) na Corporação/Filial ativa
    foreach (var ur in user.UserRoles.Where(ur => !ur.Inactive && ur.CorporationId == activeCorporation.Id))
    {
      if (ur.Role is not null && !string.IsNullOrWhiteSpace(ur.Role.Key))
      {
        if (!authClaims.Any(c => c.Type == ClaimTypes.Role && c.Value == ur.Role.Key))
        {
          authClaims.Add(new(ClaimTypes.Role, ur.Role.Key));
        }

        foreach (var rc in ur.Role.RoleClaims.Where(rc => !rc.Inactive && rc.CorporationId == activeCorporation.Id))
        {
          if (rc.Claim is not null && !string.IsNullOrWhiteSpace(rc.Claim.ClaimType) && !string.IsNullOrWhiteSpace(rc.Claim.ClaimValue))
          {
            if (!authClaims.Any(c => c.Type == rc.Claim.ClaimType && c.Value == rc.Claim.ClaimValue))
            {
              authClaims.Add(new(rc.Claim.ClaimType, rc.Claim.ClaimValue));
            }
          }
        }
      }
    }

    return authClaims;
  }
}
