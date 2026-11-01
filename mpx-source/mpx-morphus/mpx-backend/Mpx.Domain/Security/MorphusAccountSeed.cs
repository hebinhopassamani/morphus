using Mpx.Domain.Entities;

namespace Mpx.Domain.Security;

public static class MorphusAccountSeed
{
  public static (Corporation Corporation, User AdminUser) CreateInitialAccountGraph(
      CreateAccountRequest request,
      Guid? parentCorporationId = null)
  {
    var corporationId = Guid.NewGuid();

    var corporation = new Corporation
    {
      Id = corporationId,
      Name = request.CorporationName,
      FullName = request.CorporationFullName ?? request.CorporationName,
      Icon = string.IsNullOrWhiteSpace(request.CorporationIcon) ? "building-2" : request.CorporationIcon.Trim(),
      Email = request.CorporationEmail,
      Key = request.CorporationName.Trim().ToUpperInvariant().Replace(" ", "_"),
      System = true,
      CorporationId = parentCorporationId
    };

    // 1. Workspace Padrão: "Morphus Workspace"
    var defaultWorkspace = new Workspace
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Morphus Workspace",
      Key = "MORPHUS_WORKSPACE",
      Icon = "layout-grid",
      System = true,
      Inactive = false,
      Description = "Workspace padrão do ecossistema Morphus"
    };
    corporation.Workspaces.Add(defaultWorkspace);

    // 2. As 3 Applications Nativas dentro do Workspace Padrão
    var morphusApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      WorkspaceId = defaultWorkspace.Id,
      Name = "Morphus",
      Key = "MORPHUS",
      Icon = "boxes",
      System = true,
      Inactive = false,
      Description = "Aplicação principal de gestão empresarial Morphus"
    };

    var securityApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      WorkspaceId = defaultWorkspace.Id,
      Name = "Segurança",
      Key = "SECURITY",
      Icon = "shield",
      System = true,
      Inactive = false,
      Description = "Aplicação de segurança, usuários, perfis e permissões"
    };

    var websiteApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      WorkspaceId = defaultWorkspace.Id,
      Name = "Website",
      Key = "WEBSITE",
      Icon = "globe",
      System = true,
      Inactive = false,
      Description = "Portal institucional e páginas públicas do Morphus"
    };

    corporation.Applications.Add(morphusApp);
    corporation.Applications.Add(securityApp);
    corporation.Applications.Add(websiteApp);

    // 3. Status de Usuário Padrão
    var activeStatus = new UserStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Ativo",
      Key = "ACTIVE",
      System = true,
      Description = "Este status ativa o usuário"
    };

    var inactiveStatus = new UserStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Inativo",
      Key = "INACTIVE",
      System = true,
      Description = "Este status inativa o usuário"
    };

    corporation.UserStatus.Add(activeStatus);
    corporation.UserStatus.Add(inactiveStatus);

    // 4. Módulos e Submódulos Padrão vinculados ao ApplicationId correspondente
    var moduleDefinitions = new (Guid AppId, string Key, string Name, string Description, (string SubKey, string SubName, string SubDesc)[] SubModules)[]
    {
      // Módulos da Aplicação SECURITY
      (securityApp.Id, "USER", "Usuários", "Módulo responsável pelos usuários do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro dos usuários do sistema"),
        ("USER_STATUS", "Status do usuário", "Submódulo responsável pelos status do usuário"),
        ("USER_CLAIM", "Permissões do usuário", "Submódulo responsável pelas permissões de acesso do usuário"),
        ("USER_ROLE", "Perfis de acesso do usuário", "Submódulo responsável pelos perfis de acesso do usuário")
      ]),
      (securityApp.Id, "CORPORATION", "Corporações", "Módulo responsável pelas corporações e filiais do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro das corporações do sistema"),
        ("CORPORATION_USER", "Usuários da corporação", "Submódulo responsável pelo vínculo de usuários nas corporações")
      ]),
      (securityApp.Id, "CLAIM", "Permissões", "Módulo responsável pelas permissões do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro das permissões do sistema")
      ]),
      (securityApp.Id, "ROLE", "Perfis de acesso", "Módulo responsável pelos perfis de acesso do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro dos perfis de acesso do sistema"),
        ("ROLE_CLAIM", "Permissões do perfil de acesso", "Submódulo responsável pelas permissões do perfil de acesso")
      ]),

      // Módulos da Aplicação MORPHUS
      (morphusApp.Id, "WORKSPACE", "Workspaces", "Módulo responsável pelos ambientes de trabalho (workspaces) do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro dos workspaces"),
        ("WORKSPACE_USER", "Usuários do workspace", "Submódulo responsável pelo vínculo de usuários nos workspaces")
      ]),
      (morphusApp.Id, "APPLICATION", "Aplicações", "Módulo responsável pelas aplicações do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro das aplicações"),
        ("APPLICATION_USER", "Usuários da aplicação", "Submódulo responsável pelo vínculo de usuários nas aplicações")
      ]),
      (morphusApp.Id, "MENU", "Menus", "Módulo responsável pelos menus do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro dos menus do sistema")
      ]),
      (morphusApp.Id, "MODULE", "Módulos", "Módulo responsável pelos módulos do sistema", [
        ("REGISTER", "Cadastro", "Submódulo responsável pelo cadastro dos módulos do sistema")
      ])
    };

    var subModuleLookup = new Dictionary<(string ModuleKey, string SubKey), (Module Mod, SubModule Sub)>();

    foreach (var def in moduleDefinitions)
    {
      var mod = new Module
      {
        Id = Guid.NewGuid(),
        CorporationId = corporationId,
        ApplicationId = def.AppId,
        Name = def.Name,
        Key = def.Key,
        System = true,
        Description = def.Description
      };

      foreach (var subDef in def.SubModules)
      {
        var sub = new SubModule
        {
          Id = Guid.NewGuid(),
          CorporationId = corporationId,
          ModuleId = mod.Id,
          Name = subDef.SubName,
          Key = subDef.SubKey,
          System = true,
          Description = subDef.SubDesc
        };

        mod.SubModules.Add(sub);
        corporation.SubModules.Add(sub);
        subModuleLookup[(def.Key, subDef.SubKey)] = (mod, sub);
      }

      corporation.Modules.Add(mod);
    }

    // 5. Role ADMINISTRATOR
    var (roleMod, roleSub) = subModuleLookup[("ROLE", "ROLE_CLAIM")];
    var adminRole = new Role
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      ModuleId = roleMod.Id,
      SubModuleId = roleSub.Id,
      Name = "Administrator",
      Key = "ADMINISTRATOR",
      System = true,
      Description = "Perfil que tem acesso a todas as funcionalidades do sistema"
    };
    corporation.Roles.Add(adminRole);

    // 6. Claims Padrão de Todos os Módulos (incluindo Workspace, Application e Menu)
    var claimDefinitions = new (string ModKey, string SubKey, string ClaimType, string[] Values)[]
    {
      ("USER", "REGISTER", "USER", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("USER", "USER_ROLE", "USER_ROLE", ["LIST", "ADD", "REMOVE", "ACTIVATE", "INACTIVATE"]),
      ("USER", "USER_CLAIM", "USER_CLAIM", ["LIST", "ADD", "REMOVE", "ACTIVATE", "INACTIVATE"]),
      ("USER", "USER_STATUS", "USER_STATUS", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("CORPORATION", "REGISTER", "CORPORATION", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("CORPORATION", "CORPORATION_USER", "CORPORATION_USER", ["LIST", "ADD", "REMOVE", "ACTIVATE", "INACTIVATE", "SET_OWNER", "REMOVE_OWNER"]),
      ("CLAIM", "REGISTER", "CLAIM", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("ROLE", "REGISTER", "ROLE", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("ROLE", "ROLE_CLAIM", "ROLE_CLAIM", ["LIST", "ADD", "REMOVE", "ACTIVATE", "INACTIVATE"]),
      ("WORKSPACE", "REGISTER", "WORKSPACE", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("WORKSPACE", "WORKSPACE_USER", "WORKSPACE_USER", ["LIST", "ADD", "REMOVE", "ACTIVATE", "INACTIVATE", "SET_OWNER", "REMOVE_OWNER"]),
      ("APPLICATION", "REGISTER", "APPLICATION", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("APPLICATION", "APPLICATION_USER", "APPLICATION_USER", ["LIST", "ADD", "REMOVE", "ACTIVATE", "INACTIVATE", "SET_OWNER", "REMOVE_OWNER"]),
      ("MENU", "REGISTER", "MENU", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"]),
      ("MODULE", "REGISTER", "MODULE", ["GET_BY_ID", "LIST", "GET_BY_KEY", "CREATE", "UPDATE", "DELETE", "SUB_MODULES"]),
      ("MODULE", "REGISTER", "SUB_MODULE", ["GET_BY_ID", "LIST", "CREATE", "UPDATE", "DELETE"])
    };

    foreach (var cDef in claimDefinitions)
    {
      var (mod, sub) = subModuleLookup[(cDef.ModKey, cDef.SubKey)];
      foreach (var val in cDef.Values)
      {
        var claim = new Claim
        {
          Id = Guid.NewGuid(),
          CorporationId = corporationId,
          ModuleId = mod.Id,
          SubModuleId = sub.Id,
          ClaimType = cDef.ClaimType,
          ClaimValue = val,
          System = true
        };

        corporation.Claims.Add(claim);

        var roleClaim = new RoleClaim
        {
          CorporationId = corporationId,
          RoleId = adminRole.Id,
          ClaimId = claim.Id,
          Inactive = false,
          System = true
        };

        corporation.RoleClaims.Add(roleClaim);
      }
    }

    // 7. Menus Iniciais no Banco apontando para ApplicationId
    var (moduleMod, moduleSub) = subModuleLookup[("MODULE", "REGISTER")];
    var (menuMod, menuSub) = subModuleLookup[("MENU", "REGISTER")];

    var adminSectionMenu = new Menu
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      ApplicationId = morphusApp.Id,
      Label = "Administração e Segurança",
      Order = 1,
      System = true,
      Description = "Seção principal de administração e segurança"
    };

    var modulesMenuItem = new Menu
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      ApplicationId = morphusApp.Id,
      MenuId = adminSectionMenu.Id,
      ModuleId = moduleMod.Id,
      SubModuleId = moduleSub.Id,
      Label = "Módulos",
      Url = "/admin/module",
      Icon = "boxes",
      Order = 1,
      System = true,
      Description = "Gerenciamento de módulos do sistema"
    };

    var menusMenuItem = new Menu
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      ApplicationId = morphusApp.Id,
      MenuId = adminSectionMenu.Id,
      ModuleId = menuMod.Id,
      SubModuleId = menuSub.Id,
      Label = "Menus",
      Url = "/admin/menu",
      Icon = "list-tree",
      Order = 2,
      System = true,
      Description = "Gerenciamento da árvore de menus da plataforma"
    };

    corporation.Menus.Add(adminSectionMenu);
    corporation.Menus.Add(modulesMenuItem);
    corporation.Menus.Add(menusMenuItem);

    // 8. Usuário Administrador Inicial
    var adminUser = new User
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      UserStatusId = activeStatus.Id,
      Name = request.AdminName,
      Email = request.AdminEmail.Trim().ToLowerInvariant(),
      PasswordHash = MorphusSecurity.HashPassword(request.AdminPassword),
      PhoneNumber = request.PhoneNumber,
      Inactive = false,
      System = true,
      EmailConfirmed = true,
      TermsConfirmed = true
    };

    corporation.Users.Add(adminUser);

    // 9. Vínculos Administrativos (IsOwner = true) na Corporation, no Workspace e nas 3 Applications
    corporation.CorporationUsers.Add(new CorporationUser
    {
      CorporationId = corporationId,
      UserId = adminUser.Id,
      IsOwner = true,
      Inactive = false,
      System = true
    });

    corporation.WorkspaceUsers.Add(new WorkspaceUser
    {
      CorporationId = corporationId,
      WorkspaceId = defaultWorkspace.Id,
      UserId = adminUser.Id,
      IsOwner = true,
      Inactive = false,
      System = true
    });

    foreach (var app in new[] { morphusApp, securityApp, websiteApp })
    {
      corporation.ApplicationUsers.Add(new ApplicationUser
      {
        CorporationId = corporationId,
        ApplicationId = app.Id,
        UserId = adminUser.Id,
        IsOwner = true,
        Inactive = false,
        System = true
      });
    }

    // 10. Vínculo UserRole (ADMINISTRATOR)
    corporation.UserRoles.Add(new UserRole
    {
      CorporationId = corporationId,
      UserId = adminUser.Id,
      RoleId = adminRole.Id,
      Inactive = false,
      System = true
    });

    return (corporation, adminUser);
  }

  public static Corporation CreateCorporationGraphForExistingUser(
      string name,
      string email,
      Guid existingUserId,
      Guid? parentCorporationId = null,
      string? icon = "building-2",
      string? description = null,
      string? fullName = null,
      bool isSystem = false)
  {
    var tempRequest = new CreateAccountRequest
    {
      CorporationName = name,
      CorporationFullName = fullName ?? name,
      CorporationIcon = icon,
      CorporationEmail = email,
      AdminName = "Temp",
      AdminEmail = email,
      AdminPassword = "TempPassword123!"
    };

    var (corporation, tempUser) = CreateInitialAccountGraph(tempRequest, parentCorporationId);
    corporation.System = isSystem;
    corporation.Description = description;
    corporation.Icon = string.IsNullOrWhiteSpace(icon) ? "building-2" : icon.Trim();

    // Remove o usuário novo temporário da coleção Users (pois usaremos o usuário já existente)
    corporation.Users.Clear();

    // Reaponta todos os vínculos criados no grafo para o existingUserId
    foreach (var cu in corporation.CorporationUsers)
      cu.UserId = existingUserId;

    foreach (var wu in corporation.WorkspaceUsers)
      wu.UserId = existingUserId;

    foreach (var au in corporation.ApplicationUsers)
      au.UserId = existingUserId;

    foreach (var ur in corporation.UserRoles)
      ur.UserId = existingUserId;

    return corporation;
  }
}
