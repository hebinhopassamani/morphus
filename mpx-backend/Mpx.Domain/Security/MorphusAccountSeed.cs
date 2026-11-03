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
      bool isSystem = true,
      string? key = null,
      string personType = "PJ",
      string? cpfCnpj = null)
  {
    var corporationId = Guid.NewGuid();
    var cleanName = corporationName.Trim();
    var cleanPersonType = string.Equals(personType?.Trim(), "PF", StringComparison.OrdinalIgnoreCase) ? "PF" : "PJ";
    var cleanCpfCnpj = string.IsNullOrWhiteSpace(cpfCnpj)
        ? null
        : new string(cpfCnpj.Where(char.IsDigit).Take(14).ToArray());

    var corporation = new Corporation
    {
      Id = corporationId,
      Name = cleanName,
      FullName = string.IsNullOrWhiteSpace(fullName) ? cleanName : fullName.Trim(),
      PersonType = cleanPersonType,
      CpfCnpj = cleanCpfCnpj,
      Icon = string.IsNullOrWhiteSpace(icon) ? "building-2" : icon.Trim(),
      Color = "violet",
      Email = corporationEmail.Trim().ToLowerInvariant(),
      Key = string.IsNullOrWhiteSpace(key) ? MorphusEntity.GenerateKey() : key.Trim().ToUpperInvariant(),
      System = isSystem,
      Description = description,
      CorporationId = parentCorporationId
    };

    // 1. Categorias e Status de Aplicação Padrão (com Name, Label, Color, Description e Key única via MorphusEntity)
    var managementCategory = new Category
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Gestão Empresarial",
      Label = "Gestão",
      Color = "violet",
      System = true,
      Description = "Aplicações centrais de administração, estrutura corporativa e governança"
    };

    var securityCategory = new Category
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Segurança e Identidade",
      Label = "Segurança",
      Color = "indigo",
      System = true,
      Description = "Controle de equipe, perfis de acesso e permissões"
    };

    var portalCategory = new Category
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Portal e Institucional",
      Label = "Portal",
      Color = "jade",
      System = true,
      Description = "Portal central do cliente e páginas institucionais"
    };

    var automationCategory = new Category
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Automação e Conhecimento",
      Label = "Automação",
      Color = "amber",
      System = true,
      Description = "Estruturação inteligente de documentos e fluxos em segundo plano"
    };

    var commercialCategory = new Category
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Comercial e Vendas",
      Label = "Comercial",
      Color = "indigo",
      System = true,
      Description = "Relacionamento com clientes, propostas e funil de vendas"
    };

    var financeCategory = new Category
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Finanças e Fiscal",
      Label = "Finanças",
      Color = "jade",
      System = true,
      Description = "Notas fiscais, contas a pagar, contas a receber e conciliação bancária"
    };

    corporation.Categories.Add(managementCategory);
    corporation.Categories.Add(securityCategory);
    corporation.Categories.Add(portalCategory);
    corporation.Categories.Add(automationCategory);
    corporation.Categories.Add(commercialCategory);
    corporation.Categories.Add(financeCategory);

    var appActiveStatus = new ApplicationStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Ativa",
      Label = "Disponível",
      Color = "jade",
      System = true,
      Description = "Tudo pronto para você usar"
    };

    var appPreparingStatus = new ApplicationStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Em preparação",
      Label = "Sendo preparada",
      Color = "amber",
      System = true,
      Description = "Estamos preparando tudo para você"
    };

    var appTrialStatus = new ApplicationStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Em avaliação",
      Label = "Experimentando",
      Color = "violet",
      System = true,
      Description = "Aproveite para conhecer todos os recursos"
    };

    var appBlockedStatus = new ApplicationStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Bloqueada",
      Label = "Aguardando você",
      Color = "amber",
      System = true,
      Description = "Confira os detalhes da sua conta para continuar usando"
    };

    var appInactiveStatus = new ApplicationStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Inativa",
      Label = "Pausada",
      Color = "slate",
      System = true,
      Description = "Pausada no momento — reative quando quiser"
    };

    corporation.ApplicationStatuses.Add(appActiveStatus);
    corporation.ApplicationStatuses.Add(appPreparingStatus);
    corporation.ApplicationStatuses.Add(appTrialStatus);
    corporation.ApplicationStatuses.Add(appBlockedStatus);
    corporation.ApplicationStatuses.Add(appInactiveStatus);

    // 2. Aplicações Nativas e de Demonstração/Teste da Corporação (vinculadas a CategoryId, ApplicationStatusId e Color)
    var morphusApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = managementCategory.Id,
      ApplicationStatusId = appActiveStatus.Id,
      Name = "Morphus",
      Icon = "boxes",
      Color = "violet",
      System = true,
      Inactive = false,
      Description = "Aplicação principal de gestão empresarial, governança e administração Morphus"
    };

    var securityApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = securityCategory.Id,
      ApplicationStatusId = appActiveStatus.Id,
      Name = "Segurança",
      Icon = "shield",
      Color = "indigo",
      System = true,
      Inactive = false,
      Description = "Aplicação de segurança, usuários, perfis e permissões"
    };

    var websiteApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = portalCategory.Id,
      ApplicationStatusId = appActiveStatus.Id,
      Name = "Website",
      Icon = "globe",
      Color = "jade",
      System = true,
      Inactive = false,
      Description = "Portal institucional e páginas públicas do Morphus"
    };

    var kalupaApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = automationCategory.Id,
      ApplicationStatusId = appPreparingStatus.Id,
      Name = "Kalupa Automação",
      Icon = "workflow",
      Color = "amber",
      System = true,
      Inactive = false,
      Description = "Orquestração de fluxos, webhooks e integrações inteligentes em segundo plano"
    };

    var crmApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = commercialCategory.Id,
      ApplicationStatusId = appPreparingStatus.Id,
      Name = "Morphus CRM",
      Icon = "users",
      Color = "indigo",
      System = true,
      Inactive = false,
      Description = "Gestão de funil comercial, clientes, propostas e relacionamento"
    };

    var financeApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = financeCategory.Id,
      ApplicationStatusId = appActiveStatus.Id,
      Name = "Morphus Financeiro",
      Icon = "wallet",
      Color = "jade",
      System = true,
      Inactive = false,
      Description = "Contas a pagar e receber, entrada de notas fiscais, conciliação bancária e fluxo de caixa"
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
      Label = "Acesso liberado",
      Color = "jade",
      System = true,
      Description = "Este status ativa o usuário"
    };

    var inactiveStatus = new UserStatus
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      Name = "Inativo",
      Label = "Acesso pausado",
      Color = "slate",
      System = true,
      Description = "Este status inativa o usuário"
    };

    corporation.UserStatus.Add(activeStatus);
    corporation.UserStatus.Add(inactiveStatus);

    // 3A. Módulos e Submódulos de SEGURANÇA (security_modules / security_sub_modules — exclusivos para filtro de Claims/Permissões)
    var moduleDefinitions = new (Guid AppId, string Key, string Name, string Description, (string SubKey, string SubName, string SubDesc)[] SubModules)[]
    {
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
          System = true,
          Description = subDef.SubDesc
        };

        mod.SubModules.Add(sub);
        corporation.SubModules.Add(sub);
        subModuleLookup[(def.Key, subDef.SubKey)] = (mod, sub);
      }

      corporation.Modules.Add(mod);
    }

    // 3B. Módulos e Submódulos de PRODUTO DAS APLICAÇÕES (application_modules / application_sub_modules)
    var applicationModuleDefinitions = new (Guid AppId, string Name, string Label, string Icon, string Color, int Order, string Description, (string SubName, string SubLabel, string SubDesc)[] SubModules)[]
    {
      // MORPHUS FINANCEIRO
      (financeApp.Id, "Contas a Pagar", "Contas a Pagar", "wallet", "jade", 1, "Controle completo de compromissos financeiros, parcelas e aprovações de pagamento", [
        ("Títulos e Parcelas", "Títulos e Parcelas", "Lançamento e acompanhamento de títulos e vencimentos"),
        ("Aprovação de Pagamentos", "Aprovação de Pagamentos", "Alçadas e liberação de pagamentos da empresa"),
        ("Baixas, Juros e Multas", "Baixas, Juros e Multas", "Liquidação parcial ou integral com cálculo automático de encargos")
      ]),
      (financeApp.Id, "Contas a Receber", "Contas a Receber", "landmark", "jade", 2, "Gestão de recebíveis, cobranças e previsibilidade de entradas", [
        ("Faturamento e Cobranças", "Faturamento e Cobranças", "Emissão e controle de títulos a receber"),
        ("Recebimentos e Baixas", "Recebimentos e Baixas", "Confirmação de entradas e quitação de clientes")
      ]),
      (financeApp.Id, "Entrada de Notas Fiscais", "Entrada de Notas", "file-text", "jade", 3, "Recebimento automatizado de XML e validação fiscal de compras", [
        ("Importação de XML", "Importação de XML", "Leitura automática de notas fiscais eletrônicas"),
        ("Natureza de Operação e Tributos", "Natureza e Tributos", "Regras fiscais e integração direta com o Contas a Pagar")
      ]),
      (financeApp.Id, "Conciliação Bancária", "Conciliação Bancária", "chart-no-axes-combined", "jade", 4, "Integração de contas bancárias, extratos e fluxo de caixa em tempo real", [
        ("Remessa e Retorno CNAB", "Remessa e Retorno CNAB", "Processamento automatizado de arquivos bancários"),
        ("Fluxo de Caixa", "Fluxo de Caixa", "Visão consolidada do previsto vs. realizado por unidade")
      ]),

      // MORPHUS CRM
      (crmApp.Id, "Clientes e Relacionamento", "Clientes", "users", "indigo", 1, "Base unificada de clientes, contatos e histórico comercial", [
        ("Carteira de Clientes", "Carteira de Clientes", "Gestão de contas e contatos comerciais"),
        ("Histórico de Atendimentos", "Histórico de Atendimentos", "Registro de reuniões, chamadas e acompanhamentos")
      ]),
      (crmApp.Id, "Funil de Vendas", "Funil de Vendas", "sparkles", "indigo", 2, "Acompanhamento de oportunidades e propostas comerciais", [
        ("Oportunidades", "Oportunidades", "Etapas do funil e previsão de fechamento"),
        ("Propostas e Orçamentos", "Propostas e Orçamentos", "Elaboração e envio de propostas comerciais")
      ]),

      // KALUPA AUTOMAÇÃO
      (kalupaApp.Id, "Estruturação de Conhecimento", "Conhecimento IA", "workflow", "amber", 1, "Organização inteligente de documentos e entrega na pasta local", [
        ("Captura e Formatação IA", "Captura IA", "Estruturação automática de conteúdos e resumos"),
        ("Templates Inteligentes", "Templates", "Modelos personalizados da empresa"),
        ("Sincronização na Pasta Local", "Pasta Local", "Entrega invisível dos documentos aprovados no computador")
      ]),

      // MORPHUS (Gestão)
      (morphusApp.Id, "Espaços de Trabalho", "Workspaces", "layout-grid", "violet", 1, "Organização departamental e distribuição de aplicações", [
        ("Ambientes de Trabalho", "Ambientes", "Configuração de workspaces por área"),
        ("Aplicações do Workspace", "Aplicações", "Quais produtos ficam disponíveis em cada espaço"),
        ("Equipe do Workspace", "Equipe", "Pessoas vinculadas ao ambiente")
      ]),
      (morphusApp.Id, "Estrutura Corporativa", "Corporações e Filiais", "building-2", "violet", 2, "Gestão da matriz, filiais e catálogo de aplicações", [
        ("Matriz e Filiais", "Matriz e Filiais", "Unidades de negócio da corporação"),
        ("Menus e Navegação", "Menus", "Árvore dinâmica de acesso da plataforma")
      ]),

      // SEGURANÇA
      (securityApp.Id, "Pessoas e Equipe", "Equipe", "users", "indigo", 1, "Gestão das pessoas que atuam nas suas empresas e filiais", [
        ("Cadastro de Pessoas", "Pessoas", "Dados cadastrais e convites da equipe"),
        ("Status de Acesso", "Status", "Controle de acesso liberado ou pausado")
      ]),
      (securityApp.Id, "Perfis e Permissões", "Perfis de Acesso", "shield-check", "indigo", 2, "Agrupamento inteligente de permissões por função ou departamento", [
        ("Papéis da Equipe", "Papéis", "Criação de perfis como Financeiro, Fiscal ou Diretoria"),
        ("Permissões por Módulo", "Permissões", "Definição exata do que cada perfil pode acessar")
      ])
    };

    foreach (var appModDef in applicationModuleDefinitions)
    {
      var appMod = new ApplicationModule
      {
        Id = Guid.NewGuid(),
        CorporationId = corporationId,
        ApplicationId = appModDef.AppId,
        Name = appModDef.Name,
        Label = appModDef.Label,
        Icon = appModDef.Icon,
        Color = appModDef.Color,
        Order = appModDef.Order,
        System = true,
        Description = appModDef.Description
      };

      var subOrder = 1;
      foreach (var subDef in appModDef.SubModules)
      {
        var appSub = new ApplicationSubModule
        {
          Id = Guid.NewGuid(),
          CorporationId = corporationId,
          ApplicationModuleId = appMod.Id,
          Name = subDef.SubName,
          Label = subDef.SubLabel,
          Color = appModDef.Color,
          Order = subOrder++,
          System = true,
          Description = subDef.SubDesc
        };

        appMod.ApplicationSubModules.Add(appSub);
        corporation.ApplicationSubModules.Add(appSub);
      }

      corporation.ApplicationModules.Add(appMod);
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
    var (corpMod, corpSub) = subModuleLookup[("CORPORATION", "REGISTER")];
    var (wsMod, wsSub) = subModuleLookup[("WORKSPACE", "REGISTER")];
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

    var corporationsMenuItem = new Menu
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      ApplicationId = morphusApp.Id,
      MenuId = adminSectionMenu.Id,
      ModuleId = corpMod.Id,
      SubModuleId = corpSub.Id,
      Label = "Corporações",
      Url = "/admin/corporation",
      Icon = "building-2",
      Order = 1,
      System = true,
      Description = "Gerenciamento de corporações e filiais do sistema"
    };

    var workspacesMenuItem = new Menu
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      ApplicationId = morphusApp.Id,
      MenuId = adminSectionMenu.Id,
      ModuleId = wsMod.Id,
      SubModuleId = wsSub.Id,
      Label = "Workspaces",
      Url = "/admin/workspace",
      Icon = "layout-grid",
      Order = 2,
      System = true,
      Description = "Gerenciamento dos ambientes de trabalho (workspaces) da corporação"
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
      Order = 3,
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
      Order = 4,
      System = true,
      Description = "Gerenciamento da árvore de menus da plataforma"
    };

    corporation.Menus.Add(adminSectionMenu);
    corporation.Menus.Add(corporationsMenuItem);
    corporation.Menus.Add(workspacesMenuItem);
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

    foreach (var app in new[] { morphusApp, securityApp, websiteApp, kalupaApp, crmApp, financeApp })
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
      Icon = "layout-grid",
      Color = "violet",
      Default = true,
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
      bool isSystem = false,
      string? key = null,
      string personType = "PJ",
      string? cpfCnpj = null)
  {
    var (corporation, _) = CreateCorporationBaseForOnboarding(
        name,
        email,
        existingUserId,
        parentCorporationId,
        icon,
        description,
        fullName,
        isSystem,
        key,
        personType,
        cpfCnpj);

    var defaultWorkspace = new Workspace
    {
      Id = Guid.NewGuid(),
      CorporationId = corporation.Id,
      Name = "Morphus Workspace",
      Icon = "layout-grid",
      Color = "violet",
      Default = true,
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
