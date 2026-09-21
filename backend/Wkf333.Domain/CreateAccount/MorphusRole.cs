using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusRole
{
  public static void Generate(BusinessUser businessUser)
  {
    var roleModule = businessUser.Business!.Modules.FirstOrDefault(x => x.Key == "ROLE");
    var roleSubModule = roleModule!.SubModules.FirstOrDefault(f => f.Key == "ROLE_CLAIM");

    var role = new Role
    {
      Name = "Administrator",
      Key = "ADMINISTRATOR",
      System = true,
      Description = "Perfil que tem acesso a todas as funcionalidades do sistema",
      Module = roleModule,
      SubModule = roleSubModule,
    };

    businessUser.Business.Roles.Add(role);
  }
}
