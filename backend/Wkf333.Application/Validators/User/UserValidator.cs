using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusValidator;
using Morphus.Application.Services.UserService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Validators;

public class UserValidator(IUserService userService, IHttpContextAccessor httpContext) : MorphusValidator<User>(httpContext), IUserValidator
{
  private readonly IUserService _userService = userService;

  public async Task ValidateDeleteEntity(Guid id)
  {
    var user = await _userService.GetById(id);

    if (user is null)
    {
      AddErrorMessage("Ocorreu um erro desconhecido, usuário não encontrado");
    }

    if (user?.UserClaims is not null && user.UserClaims.Count > 0)
    {
      AddErrorMessage(
          "Não é possivel excluir o usuário pois ele está relacionado com "
              + user.UserClaims.Count.ToString().PadLeft(2)
              + " permissòes de acesso"
      );
    }

    if (user?.BusinessUsers is not null && user.BusinessUsers.Count > 0)
    {
      AddErrorMessage(
          "Não é possivel excluir o usuário pois ele está relacionado com " + user.BusinessUsers.Count.ToString().PadLeft(2) + " Empresas"
      );
    }

    if (user?.UserRoles is not null && user.UserRoles.Count > 0)
    {
      AddErrorMessage(
          "Não é possivel excluir o usuário pois ele está relacionado com " + user.UserRoles.Count.ToString().PadLeft(2) + " perfis de acesso"
      );
    }
  }
}
