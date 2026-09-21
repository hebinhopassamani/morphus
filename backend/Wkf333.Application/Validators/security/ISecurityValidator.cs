using Morphus.Application.MorphusValidator;
using Morphus.Domain.Dtos.Account;

namespace Morphus.Application.Validators;

public interface ISecurityValidator : IMorphusValidator<AccountDTO>
{
  Task ValidateAccount(AccountDTO account);
}
