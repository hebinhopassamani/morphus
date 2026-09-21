using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Morphus.Application.MorphusService;
using Morphus.Domain.IRepositories;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Entities.Security;
using Morphus.Core.MorphusSecurity;
using Morphus.Domain.ITransaction;
using Morphus.Domain.Dtos.Account;
using AutoMapper;

namespace Morphus.Application.Services.security;

public class SecurityService(IUserRepository mpsUserRepository,
                             IBusinessRepository mpsBusinessRepository,
                             IMorphusTransaction mpsTransaction,
                             IConfiguration mpsConfiguration,
                             IHttpContextAccessor httpContext,
                             IMapper mpsMapper) : MorphusService<User>(httpContext), ISecurityService
{
  private readonly IBusinessRepository businessRepository = mpsBusinessRepository;
  private readonly IUserRepository userRepository = mpsUserRepository;
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IConfiguration configuration = mpsConfiguration;
  private readonly IMapper mapper = mpsMapper;

  public async Task<MorphusSession?> Login(Login login)
  {
    var session = new MorphusSession();
    var authenticated = false;

    if (string.IsNullOrEmpty(login.Email))
      return null;

    if (string.IsNullOrEmpty(login.Password) && !login.RefreshLogin)
      return null;

    session.User = await userRepository.GetByLogin(login.Email);

    if (session.User is null)
      return null;

    if (session.User.BusinessUsers is null || session.User.BusinessUsers.Count == 0)
      return null;

    if (!login.RefreshLogin && !string.IsNullOrEmpty(login.Password) && !string.IsNullOrEmpty(session.User.PasswordHash))
      authenticated = MorphusSecurity.VerifyPassword(login.Password, session.User.PasswordHash);

    if (authenticated || login.RefreshLogin)
    {
      if (session.User.BusinessUsers.Count == 1)
        session.Business = session.User.BusinessUsers[0].Business;

      if (session.User.BusinessUsers.Count > 1 && login.BusinessId is not null)
        session.Business = session.User.BusinessUsers.FirstOrDefault(f => f.BusinessId == login.BusinessId)?.Business;

      AuthorizeSession(session);

      await userRepository.UpdateNotNull(session.User);
      await transaction.Commit();

      return session;
    }

    return null;
  }

  public async Task<MorphusSession?> RefreshToken(Login login)
  {
    var session = new MorphusSession
    {
      User = await userRepository.GetByRefreshToken(login.RefreshToken!)
    };

    if (session.User is null)
      return null;

    var refreshTokenExired = session.User.RefreshTokenExpiration < DateTime.Now;

    if (refreshTokenExired)
      return null;

    if (session.User.BusinessUsers.Count == 1)
      session.Business = session.User.BusinessUsers[0].Business;

    if (session.User.BusinessUsers.Count > 1 && BusinessId is not null)
      session.Business = session.User.BusinessUsers.FirstOrDefault(f => f.BusinessId == BusinessId)?.Business;

    AuthorizeSession(session);

    await userRepository.UpdateNotNull(session.User);
    await transaction.Commit();

    return session;
  }

  public async Task<AccountDTO?> GetAccount(Guid businessId)
  {
    var businessUser = await businessRepository.GetAccount(businessId);

    var account = mapper.Map<AccountDTO>(businessUser);

    account.User.PasswordHash = null;

    return account;
  }

  public async Task<MorphusSession?> CreateAccountAndLogin(AccountDTO account)
  {
    await CreateAccount(account);

    return await Login(new Login
    {
      Email = account.Business!.Email,
      BusinessId = account.Business.Id,
      RefreshLogin = true
    });
  }

  public async Task<AccountDTO?> CreateAccount(AccountDTO account)
  {
    var businessUser = mapper.Map<BusinessUser>(account);

    await businessRepository.CreateAccount(businessUser);

    await transaction.Commit();

    account = mapper.Map<AccountDTO>(businessUser);

    return account;
  }

  public async Task<AccountDTO?> UpdateAccount(AccountDTO account)
  {
    var businessUser = mapper.Map<BusinessUser>(account);

    await businessRepository.UpdateAccount(businessUser);

    await transaction.Commit();

    account = mapper.Map<AccountDTO>(businessUser);

    return account;
  }

  public async Task<bool> Revoke(string email)
  {
    var user = await userRepository.GetByEmail(email);

    if (user is not null)
    {
      user.SecurityStamp = null;

      userRepository.Update(user);

      await transaction.Commit();

      return true;
    }

    return false;
  }

  private bool AuthorizeSession(MorphusSession session)
  {
    if (session.User is null)
    {
      return false;
    }

    var creationDate = DateTime.Now;

    var AccessTokenExpiresMinutes = configuration.GetSection("JWT").GetValue<int>("AccessTokenExpires");
    var RefreshTokenExpiresMinutes = configuration.GetSection("JWT").GetValue<int>("RefreshTokenExpires");
    var AccessTokenExpiresDate = creationDate.AddMinutes(AccessTokenExpiresMinutes);
    var RefreshTokenExpiresDate = creationDate.AddMinutes(RefreshTokenExpiresMinutes);

    var permissions = GetPermissions(session);
    var accessToken = GenerateAccessToken(permissions, creationDate, AccessTokenExpiresDate);

    session.User.RefreshTokenExpiration = RefreshTokenExpiresDate;
    session.User.RefreshToken = Generateoken();
    session.User.SecurityStamp = Generateoken();

    session.AccessToken = new AccesssToken
    {
      Value = new JwtSecurityTokenHandler().WriteToken(accessToken),
      CreationDate = creationDate,
      ExpirationDate = AccessTokenExpiresDate,
      ExpirationTime = EpochTime.GetIntDate(creationDate.AddMinutes(AccessTokenExpiresMinutes)),
    };

    session.RefreshToken = new RefreshToken
    {
      Value = session.User.RefreshToken,
      CreationDate = creationDate,
      ExpirationDate = RefreshTokenExpiresDate,
      ExpirationTime = EpochTime.GetIntDate(creationDate.AddMinutes(RefreshTokenExpiresMinutes)),
    };

    return true;
  }

  private JwtSecurityToken GenerateAccessToken(IEnumerable<System.Security.Claims.Claim> claims, DateTime criationDate, DateTime expirationDate)
  {
    var key = configuration.GetSection("JWT").GetValue<string>("SecretKey") ?? throw new InvalidOperationException("Invalid secret Key");
    var privateKey = Encoding.UTF8.GetBytes(key);
    var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(privateKey), SecurityAlgorithms.HmacSha256Signature);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
      Subject = new ClaimsIdentity(claims),
      NotBefore = criationDate,
      Expires = expirationDate,
      Audience = configuration.GetSection("JWT").GetValue<string>("ValidAudience"),
      Issuer = configuration.GetSection("JWT").GetValue<string>("ValidIssuer"),
      SigningCredentials = signingCredentials,
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);

    return token;
  }

  private static string Generateoken()
  {
    var secureRandomBytes = new byte[128];
    var randomNumberGenerator = RandomNumberGenerator.Create();

    randomNumberGenerator.GetBytes(secureRandomBytes);

    var refreshToken = Convert.ToBase64String(secureRandomBytes);

    return refreshToken;
  }

  private static List<System.Security.Claims.Claim> GetPermissions(MorphusSession session)
  {
    List<System.Security.Claims.Claim> authClaims = [];

    authClaims.Add(new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));

    if (session.User?.Email is not null)
      authClaims.Add(new(ClaimTypes.Email, session.User.Email));
    if (session.User?.Name is not null)
      authClaims.Add(new(ClaimTypes.Name, session.User.Name));

    if (session is not null && session.User is not null)
    {
      foreach (var userClaim in session.User.UserClaims)
      {
        if (userClaim is not null && userClaim.Claim is not null && userClaim.Claim.ClaimType is not null && userClaim.Claim.ClaimValue is not null)
        {
          if (authClaims.Find(c => c.Value == userClaim.Claim.ClaimValue && c.Type == userClaim.Claim.ClaimType) is null)
          {
            authClaims.Add(new(userClaim.Claim.ClaimType, userClaim.Claim.ClaimValue));
          }
        }
      }

      foreach (var userRole in session.User.UserRoles)
      {
        if (userRole.Role is not null && userRole.Role.Key is not null)
        {
          authClaims.Add(new(ClaimTypes.Role, userRole.Role.Key));

          foreach (var roleClaim in userRole.Role.RoleClaims)
          {
            if (roleClaim is not null && roleClaim.Claim is not null && roleClaim.Claim.ClaimType is not null && roleClaim.Claim.ClaimValue is not null)
            {
              if (authClaims.Find(c => c.Value == roleClaim.Claim.ClaimValue && c.Type == roleClaim.Claim.ClaimType) is null)
              {
                authClaims.Add(new(roleClaim.Claim.ClaimType, roleClaim.Claim.ClaimValue));
              }
            }
          }
        }
      }
    }

    return authClaims;
  }
}
