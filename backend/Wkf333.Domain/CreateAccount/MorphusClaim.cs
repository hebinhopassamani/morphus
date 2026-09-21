using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusClaim
{
  public static void Generate(BusinessUser businessUser)
  {
    Claim claim;

    foreach (var module in businessUser.Business!.Modules)
    {
      switch (module.Key)
      {
        case "USER":
          var registerSubModule = module.SubModules.FirstOrDefault(f => f.Key == "REGISTER")!;
          var userStatusSubModule = module.SubModules.FirstOrDefault(f => f.Key == "USER_STATUS")!;
          var userClaimSubModule = module.SubModules.FirstOrDefault(f => f.Key == "USER_CLAIM")!;
          var userRoleSubModule = module.SubModules.FirstOrDefault(f => f.Key == "USER_ROLE")!;

          claim = new Claim
          {
            ClaimType = "USER",
            ClaimValue = "GET_BY_ID",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER",
            ClaimValue = "LIST",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER",
            ClaimValue = "CREATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER",
            ClaimValue = "UPDATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER",
            ClaimValue = "DELETE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_ROLE",
            ClaimValue = "LIST",
            ModuleId = module.Id,
            SubModuleId = userRoleSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userRoleSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_ROLE",
            ClaimValue = "ADD",
            ModuleId = module.Id,
            SubModuleId = userRoleSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userRoleSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_ROLE",
            ClaimValue = "REMOVER",
            ModuleId = module.Id,
            SubModuleId = userRoleSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userRoleSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_ROLE",
            ClaimValue = "ACTIVATE",
            ModuleId = module.Id,
            SubModuleId = userRoleSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userRoleSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_ROLE",
            ClaimValue = "INACTIVATE",
            ModuleId = module.Id,
            SubModuleId = userRoleSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userRoleSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_CLAIM",
            ClaimValue = "LIST",
            ModuleId = module.Id,
            SubModuleId = userClaimSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_CLAIM",
            ClaimValue = "ADD",
            ModuleId = module.Id,
            SubModuleId = userClaimSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_CLAIM",
            ClaimValue = "REMOVE",
            ModuleId = module.Id,
            SubModuleId = userClaimSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_CLAIM",
            ClaimValue = "ACTIVATE",
            ModuleId = module.Id,
            SubModuleId = userClaimSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_CLAIM",
            ClaimValue = "INACTIVATE",
            ModuleId = module.Id,
            SubModuleId = userClaimSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_STATUS",
            ClaimValue = "GET_BY_ID",
            ModuleId = module.Id,
            SubModuleId = userStatusSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userStatusSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_STATUS",
            ClaimValue = "LIST",
            ModuleId = module.Id,
            SubModuleId = userStatusSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userStatusSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_STATUS",
            ClaimValue = "CREATE",
            ModuleId = module.Id,
            SubModuleId = userStatusSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userStatusSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_STATUS",
            ClaimValue = "UPDATE",
            ModuleId = module.Id,
            SubModuleId = userStatusSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userStatusSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "USER_STATUS",
            ClaimValue = "DELETE",
            ModuleId = module.Id,
            SubModuleId = userStatusSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = userStatusSubModule
          };

          businessUser.Business!.Claims.Add(claim);
          break;
        case "BUSINESS":
          var businessUserSubModule = module.SubModules.FirstOrDefault(f => f.Key == "BUSINESS_USER")!;
          registerSubModule = module.SubModules.FirstOrDefault(f => f.Key == "REGISTER")!;

          claim = new Claim
          {
            ClaimType = "BUSINESS",
            ClaimValue = "GET_BY_ID",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS",
            ClaimValue = "LIST",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS",
            ClaimValue = "CREATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS",
            ClaimValue = "UPDATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS",
            ClaimValue = "DELETE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS_USER",
            ClaimValue = "LIST",
            ModuleId = module.Id,
            SubModuleId = businessUserSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = businessUserSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS_USER",
            ClaimValue = "ADD",
            ModuleId = module.Id,
            SubModuleId = businessUserSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = businessUserSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS_USER",
            ClaimValue = "REMOVE",
            ModuleId = module.Id,
            SubModuleId = businessUserSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = businessUserSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS_USER",
            ClaimValue = "ACTIVATE",
            ModuleId = module.Id,
            SubModuleId = businessUserSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = businessUserSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS_USER",
            ClaimValue = "INACTIVATE",
            ModuleId = module.Id,
            SubModuleId = businessUserSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = businessUserSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS_USER",
            ClaimValue = "SET_OWNER",
            ModuleId = module.Id,
            SubModuleId = businessUserSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = businessUserSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "BUSINESS_USER",
            ClaimValue = "REMOVE_OWNER",
            ModuleId = module.Id,
            SubModuleId = businessUserSubModule.Id,
            System = true,
            Description = null,
            Module = module,
            SubModule = businessUserSubModule
          };

          businessUser.Business!.Claims.Add(claim);
          break;
        case "CLAIM":
          registerSubModule = module.SubModules.FirstOrDefault(f => f.Key == "REGISTER")!;

          claim = new Claim
          {
            ClaimType = "CLAIM",
            ClaimValue = "GET_BY_ID",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "CLAIM",
            ClaimValue = "LIST",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "CLAIM",
            ClaimValue = "CREATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "CLAIM",
            ClaimValue = "UPDATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "CLAIM",
            ClaimValue = "DELETE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);
          break;
        case "ROLE":
          var roleClaimSubModule = module.SubModules.FirstOrDefault(f => f.Key == "ROLE_CLAIM")!;
          registerSubModule = module.SubModules.FirstOrDefault(f => f.Key == "REGISTER")!;

          claim = new Claim
          {
            ClaimType = "ROLE",
            ClaimValue = "GET_BY_ID",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE",
            ClaimValue = "LIST",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE",
            ClaimValue = "CREATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE",
            ClaimValue = "UPDATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE",
            ClaimValue = "DELETE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE_CLAIM",
            ClaimValue = "LIST",
            System = true,
            Description = null,
            Module = module,
            SubModule = roleClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE_CLAIM",
            ClaimValue = "ADD",

            System = true,
            Description = null,
            Module = module,
            SubModule = roleClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE_CLAIM",
            ClaimValue = "REMOVE",

            System = true,
            Description = null,
            Module = module,
            SubModule = roleClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE_CLAIM",
            ClaimValue = "ACTIVATE",

            System = true,
            Description = null,
            Module = module,
            SubModule = roleClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "ROLE_CLAIM",
            ClaimValue = "INACTIVATE",

            System = true,
            Description = null,
            Module = module,
            SubModule = roleClaimSubModule
          };

          businessUser.Business!.Claims.Add(claim);
          break;
        case "MODULE":
          registerSubModule = module.SubModules.FirstOrDefault(f => f.Key == "REGISTER")!;

          claim = new Claim
          {
            ClaimType = "MODULE",
            ClaimValue = "GET_BY_ID",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "MODULE",
            ClaimValue = "LIST",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "MODULE",
            ClaimValue = "GET_BY_KEY",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "MODULE",
            ClaimValue = "CREATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "MODULE",
            ClaimValue = "UPDATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "MODULE",
            ClaimValue = "DELETE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "MODULE",
            ClaimValue = "SUB_MODULES",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "SUB_MODULE",
            ClaimValue = "GET_BY_ID",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "SUB_MODULE",
            ClaimValue = "LIST",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "SUB_MODULE",
            ClaimValue = "CREATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "SUB_MODULE",
            ClaimValue = "UPDATE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);

          claim = new Claim
          {
            ClaimType = "SUB_MODULE",
            ClaimValue = "DELETE",
            System = true,
            Description = null,
            Module = module,
            SubModule = registerSubModule
          };

          businessUser.Business!.Claims.Add(claim);
          break;
      }
    }
  }
}
