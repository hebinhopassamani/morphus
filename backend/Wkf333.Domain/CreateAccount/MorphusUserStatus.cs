using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusUsertatus
{
  public static void Generate(BusinessUser businesUser)
  {
    UserStatus userStatus;

    userStatus = new UserStatus
    {
      Name = "Ativo",
      Key = "ACTIVE",
      System = true,
      Description = "Este status ativa o usuário",
    };

    businesUser.Business!.UserStatus.Add(userStatus);

    userStatus = new UserStatus
    {
      Name = "Inativo",
      Key = "INACTIVE",
      System = true,
      Description = "Este status inativa o usuário"
    };

    businesUser.Business!.UserStatus.Add(userStatus);
  }
}
