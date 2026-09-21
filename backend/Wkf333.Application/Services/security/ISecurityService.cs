using Morphus.Application.MorphusService;
using Morphus.Domain.Dtos.Account;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Entities.Security;

namespace Morphus.Application.Services.security;

public interface ISecurityService : IMorphusService<User>
{
  Task<MorphusSession?> Login(Login login);
  Task<MorphusSession?> RefreshToken(Login login);
  Task<AccountDTO?> GetAccount(Guid businessId);
  Task<AccountDTO?> CreateAccount(AccountDTO account);
  Task<AccountDTO?> UpdateAccount(AccountDTO account);
  Task<MorphusSession?> CreateAccountAndLogin(AccountDTO account);
  Task<bool> Revoke(string email);
}
