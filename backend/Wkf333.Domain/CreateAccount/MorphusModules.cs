using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusModules
{
  public static void Generate(BusinessUser businessUser)
  {
    Module module;

    module = new Module
    {
      Name = "Usuários",
      Key = "USER",
      System = true,
      Description = "Módulo responsável pelos usuário do sistema",
    };

    businessUser.Business!.Modules.Add(module);

    module = new Module
    {
      Name = "Empresa",
      Key = "BUSINESS",
      System = true,
      Description = "Módulo responsável pelas empresas do sistema"
    };

    businessUser.Business!.Modules.Add(module);

    module = new Module
    {
      Name = "Permissões",
      Key = "CLAIM",
      System = true,
      Description = "Módulo responsável pelas permissões do sistema"
    };

    businessUser.Business!.Modules.Add(module);

    module = new Module
    {
      Name = "Perfís de acesso",
      Key = "ROLE",
      System = true,
      Description = "Módulo responsável pelos perfis de acesso do sistema"
    };

    businessUser.Business!.Modules.Add(module);

    module = new Module
    {
      Name = "Menus",
      Key = "MENU",
      System = true,
      Description = "Módulo responsável pelos menus do sistema"
    };

    businessUser.Business!.Modules.Add(module);

    module = new Module
    {
      Name = "Modulos",
      Key = "MODULE",
      System = true,
      Description = "Módulo responsável pelos modulos do sistema"
    };

    businessUser.Business!.Modules.Add(module);
  }
}
