using Mpx.Domain.Entities;

namespace Mpx.Domain.Security;

public static class MorphusAccountSeed
{
  public static (Corporation Corporation, Guid ActiveUserStatusId) CreateCorporationBaseForOnboarding(
      string corporationName,
      string corporationEmail,
      Guid existingUserId,
      Guid? parentCorporationId = null,
      string? icon = "building-2",
      string? description = null,
      string? fullName = null,
      bool isSystem = true)
  {
    var corporationId = Guid.NewGuid();
    var cleanName = corporationName.Trim();

    var corporation = new Corporation
    {
      Id = corporationId,
      Name = cleanName,
      FullName = string.IsNullOrWhiteSpace(fullName) ? cleanName : fullName.Trim(),
      Icon = string.IsNullOrWhiteSpace(icon) ? "building-2" : icon.Trim(),
      Email = corporationEmail.Trim().ToLowerInvariant(),
      Key = cleanName.ToUpperInvariant().Replace(" ", "_"),
      System = isSystem,
      Description = description,
      CorporationId = parentCorporationId
    };

    // 1. Aplicações Nativas e de Demonstração/Teste da Corporação (sem vínculo fixo de WorkspaceId, N:N via WorkspaceApplication)
    var morphusApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Morphus",
      Key = "MORPHUS",
      Icon = "boxes",
      System = true,
      Inactive = false,
      Description = "Aplicação principal de gestão empresarial, governança e administração Morphus"
    };

    var securityApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
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
      Name = "Website",
      Key = "WEBSITE",
      Icon = "globe",
      System = true,
      Inactive = false,
      Description = "Portal institucional e páginas públicas do Morphus"
    };

    var kalupaApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Kalupa Automação",
      Key = "KALUPA",
      Icon = "workflow",
      System = false,
      Inactive = false,
      Description = "Orquestração de fluxos, webhooks e integrações inteligentes em segundo plano"
    };

    var crmApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Morphus CRM",
      Key = "CRM",
      Icon = "users",
      System = false,
      Inactive = false,
      Description = "Gestão de funil comercial, clientes, propostas e relacionamento"
    };

    var financeApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Morphus Financeiro",
      Key = "FINANCE",
      Icon = "wallet",
      System = false,
      Inactive = false,
      Description = "Contas a pagar e receber, fluxo de caixa, centros de custo e faturamento"
    };

    corporation.Applications.Add(morphusApp);
    corporation.Applications.Add(securityApp);
    corporation.Applications.Add(websiteApp);
    corporation.Applications.Add(kalupaApp);
    corporation.Applications.Add(crmApp);
    corporation.Applications.Add(financeApp);

    // 2. Status de Usuário Padrão
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

    // 3. Módulos e Submódulos Padrão vinculados ao ApplicationId correspondente
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
        ("WORKSPACE_USER", "Usuários do workspace", "Submódulo responsável pelo vínculo de usuários nos workspaces"),
        ("WORKSPACE_APPLICATION", "Aplicações do workspace", "Submódulo responsável pelo vínculo de aplicações nos workspaces")
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

    // 4. Role ADMINISTRATOR
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

    // 5. Claims Padrão de Todos os Módulos (incluindo WorkspaceApplication)
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
      ("WORKSPACE", "WORKSPACE_APPLICATION", "WORKSPACE_APPLICATION", ["LIST", "ADD", "REMOVE", "ACTIVATE", "INACTIVATE"]),
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

    // 6. Menus Iniciais no Banco apontando para ApplicationId
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

    // 7. Vínculos Administrativos do existingUserId na Corporation, nas Applications Nativas e na Role ADMINISTRATOR
    corporation.CorporationUsers.Add(new CorporationUser
    {
      CorporationId = corporationId,
      UserId = existingUserId,
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
        UserId = existingUserId,
        IsOwner = true,
        Inactive = false,
        System = true
      });
    }

    corporation.UserRoles.Add(new UserRole
    {
      CorporationId = corporationId,
      UserId = existingUserId,
      RoleId = adminRole.Id,
      Inactive = false,
      System = true
    });

    return (corporation, activeStatus.Id);
  }

  public static (Corporation Corporation, User AdminUser) CreateInitialAccountGraph(
      CreateAccountRequest request,
      Guid? parentCorporationId = null)
  {
    var adminUserId = Guid.NewGuid();
    var corpName = string.IsNullOrWhiteSpace(request.CorporationName)
        ? (request.AdminName ?? request.AdminEmail.Split('@')[0])
        : request.CorporationName.Trim();
    var corpEmail = string.IsNullOrWhiteSpace(request.CorporationEmail)
        ? request.AdminEmail.Trim().ToLowerInvariant()
        : request.CorporationEmail.Trim().ToLowerInvariant();

    var (corporation, activeStatusId) = CreateCorporationBaseForOnboarding(
        corpName,
        corpEmail,
        adminUserId,
        parentCorporationId,
        request.CorporationIcon,
        null,
        request.CorporationFullName ?? corpName,
        true);

    // Cria Workspace padrão e vincula as aplicações nativas
    var defaultWorkspace = new Workspace
    {
      Id = Guid.NewGuid(),
      CorporationId = corporation.Id,
      Name = "Morphus Workspace",
      Key = "MORPHUS_WORKSPACE",
      Icon = "layout-grid",
      System = true,
      Inactive = false,
      Description = "Workspace padrão do ecossistema Morphus"
    };
    corporation.Workspaces.Add(defaultWorkspace);

    corporation.WorkspaceUsers.Add(new WorkspaceUser
    {
      CorporationId = corporation.Id,
      WorkspaceId = defaultWorkspace.Id,
      UserId = adminUserId,
      IsOwner = true,
      Inactive = false,
      System = true
    });

    foreach (var app in corporation.Applications.Where(a => a.System))
    {
      corporation.WorkspaceApplications.Add(new WorkspaceApplication
      {
        CorporationId = corporation.Id,
        WorkspaceId = defaultWorkspace.Id,
        ApplicationId = app.Id,
        Inactive = false,
        System = true
      });
    }

    var adminUser = new User
    {
      Id = adminUserId,
      CorporationId = corporation.Id,
      UserStatusId = activeStatusId,
      Name = string.IsNullOrWhiteSpace(request.AdminName) ? request.AdminEmail.Split('@')[0] : request.AdminName.Trim(),
      Email = request.AdminEmail.Trim().ToLowerInvariant(),
      PasswordHash = MorphusSecurity.HashPassword(request.AdminPassword),
      PhoneNumber = request.PhoneNumber,
      Inactive = false,
      System = true,
      EmailConfirmed = true,
      TermsConfirmed = true,
      OnboardingCompleted = true
    };

    corporation.Users.Add(adminUser);

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
    var (corporation, _) = CreateCorporationBaseForOnboarding(
        name,
        email,
        existingUserId,
        parentCorporationId,
        icon,
        description,
        fullName,
        isSystem);

    var defaultWorkspace = new Workspace
    {
      Id = Guid.NewGuid(),
      CorporationId = corporation.Id,
      Name = "Morphus Workspace",
      Key = "MORPHUS_WORKSPACE",
      Icon = "layout-grid",
      System = true,
      Inactive = false,
      Description = "Workspace padrão do ecossistema Morphus"
    };
    corporation.Workspaces.Add(defaultWorkspace);

    corporation.WorkspaceUsers.Add(new WorkspaceUser
    {
      CorporationId = corporation.Id,
      WorkspaceId = defaultWorkspace.Id,
      UserId = existingUserId,
      IsOwner = true,
      Inactive = false,
      System = true
    });

    foreach (var app in corporation.Applications.Where(a => a.System))
    {
      corporation.WorkspaceApplications.Add(new WorkspaceApplication
      {
        CorporationId = corporation.Id,
        WorkspaceId = defaultWorkspace.Id,
        ApplicationId = app.Id,
        Inactive = false,
        System = true
      });
    }

    return corporation;
  }
}
