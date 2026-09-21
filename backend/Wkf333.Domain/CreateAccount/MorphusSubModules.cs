using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusSubModules
{
  public static void Generate(BusinessUser businessUser)
  {
    SubModule subModule;

    foreach (var module in businessUser.Business!.Modules)
    {
      switch (module.Key)
      {
        case "USER":
          subModule = new SubModule
          {
            Name = "Cadastro",
            Key = "REGISTER",
            System = true,
            Description = "Sub módulo responsável pelo cadastro dos usuário do sistema"
          };

          module.SubModules.Add(subModule);

          subModule = new SubModule
          {
            Name = "Status do usuário",
            Key = "USER_STATUS",
            System = true,
            Description = "Sub módulo responsável pelos status do usuário"
          };

          module.SubModules.Add(subModule);

          subModule = new SubModule
          {
            Name = "Permissões do usuário",
            Key = "USER_CLAIM",
            System = true,
            Description = "Sub módulo responsável pelas permissões de acesso do usuário"
          };

          module.SubModules.Add(subModule);

          subModule = new SubModule
          {
            Name = "Perfís de acesso do usuário",
            Key = "USER_ROLE",
            System = true,
            Description = "Sub módulo responsável pelos perfís de acesso do usuário"
          };

          module.SubModules.Add(subModule);

          break;
        case "BUSINESS":
          subModule = new SubModule
          {
            Name = "Cadastro",
            Key = "REGISTER",
            System = true,
            Description = "Sub módulo responsável pelo cadastro das empreas do sistemas"
          };

          module.SubModules.Add(subModule);

          subModule = new SubModule
          {
            Name = "Usuários da empresa",
            Key = "BUSINESS_USER",
            System = true,
            Description = "Sub módulo responsável pelo vinculo de usuários nas empresas"
          };

          module.SubModules.Add(subModule);

          break;
        case "CLAIM":
          subModule = new SubModule
          {
            Name = "Cadastro",
            Key = "REGISTER",
            System = true,
            Description = "Sub módulo responsável pelo cadastro das permissões do sistema"
          };

          module.SubModules.Add(subModule);

          break;
        case "ROLE":
          subModule = new SubModule
          {
            Name = "Cadastro",
            Key = "REGISTER",
            System = true,
            Description = "Sub módulo responsável pelo cadastro dos perfis de acesso do sistema"
          };

          module.SubModules.Add(subModule);

          subModule = new SubModule
          {
            Name = "Permissões do perfil de acesso",
            Key = "ROLE_CLAIM",
            System = true,
            Description = "Sub módulo responsável pelas permissões de acesso do perfil de acesso"
          };

          module.SubModules.Add(subModule);

          break;
        case "MENU":
          subModule = new SubModule
          {
            Name = "Cadastro",
            Key = "REGISTER",
            System = true,
            Description = "Sub módulo responsável pelo cadastro dos menus do sistemas"
          };

          module.SubModules.Add(subModule);

          break;
        case "MODULE":
          subModule = new SubModule
          {
            Name = "Cadastro",
            Key = "REGISTER",
            System = true,
            Description = "Sub módulo responsável pelo cadastro dos menus do sistemas"
          };

          module.SubModules.Add(subModule);

          break;
      }
    }
  }
}
