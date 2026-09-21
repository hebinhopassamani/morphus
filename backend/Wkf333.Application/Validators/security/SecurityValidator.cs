using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusValidator;
using Morphus.Application.Services.UserService;
using Morphus.Domain.Dtos.Account;

namespace Morphus.Application.Validators;

public class SecurityValidator(IUserService mpsUserService, IHttpContextAccessor httpContext) : MorphusValidator<AccountDTO>(httpContext), ISecurityValidator
{
  private readonly IUserService userService = mpsUserService;

  public async Task ValidateAccount(AccountDTO account)
  {
    if (account.Business is null)
    {
      AddErrorMessage("Informe os dados de uma empresa paraa o cadastro");
    }
    else
    {
      if (account.Business.Name is null)
        AddErrorMessage("Informe o nome da empresa");

      if (account.Business?.Key is null)
        AddErrorMessage("Informe uma chave única para a empresa");
    }

    if (account.User is null)
    {
      AddErrorMessage("Informe um usuário para ser administrador da empresa");
    }
    else
    {
      if (account.User.Name is null)
        AddErrorMessage("Informe o nome do usuário master da empresa");

      if (account.User.Email is null)
        AddErrorMessage("Informe o e-mail do usuário master da empresa");
      else
      {
        var existsEmail = await userService.ExistsEmail(account.User.Email, account.User.Id);

        if (existsEmail)
        {
          AddErrorMessage("O e-mail informado já esta sendo utilizado");
        }
      }

      if (account.User.Id == Guid.Empty && account.User.PasswordHash is null)
        AddErrorMessage("Informe a senha do usuário master da empresa");

      if (account.User.TermsConfirmed == false)
        AddErrorMessage("Você deve aprovar ows termos de concentimento");
    }
  }
}
