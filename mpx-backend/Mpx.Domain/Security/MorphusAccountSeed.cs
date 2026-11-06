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
      Prefix = "MPX",
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
      Prefix = "SEC",
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
      Prefix = "WEB",
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
      Prefix = "KAL",
      Icon = "workflow",
      Color = "amber",
      AvailableForTrial = false,
      System = false,
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
      Prefix = "CRM",
      Icon = "users",
      Color = "indigo",
      AvailableForTrial = false,
      System = false,
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
      Prefix = "FIN",
      Icon = "wallet",
      Color = "jade",
      Default = true,
      AvailableForTrial = true,
      System = false,
      Inactive = false,
      Description = "Contas a pagar e receber, entrada de notas fiscais, conciliação bancária e fluxo de caixa"
    };

    var flowApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = automationCategory.Id,
      ApplicationStatusId = appActiveStatus.Id,
      Name = "Morphus Flow",
      Prefix = "FLW",
      Icon = "workflow",
      Color = "violet",
      AvailableForTrial = true,
      System = false,
      Inactive = false,
      Description = "Motor visual de workflows configuráveis, aprovações por alçada e automação entre departamentos"
    };

    var mailApp = new MorphusApplication
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      CategoryId = commercialCategory.Id,
      ApplicationStatusId = appActiveStatus.Id,
      Name = "Morphus Mail",
      Prefix = "MAL",
      Icon = "mail",
      Color = "jade",
      AvailableForTrial = true,
      System = false,
      Inactive = false,
      Description = "Disparo de e-mails transacionais de alta entregabilidade, templates HTML e domínios verificados"
    };

    corporation.Applications.Add(morphusApp);
    corporation.Applications.Add(securityApp);
    corporation.Applications.Add(websiteApp);
    corporation.Applications.Add(kalupaApp);
    corporation.Applications.Add(crmApp);
    corporation.Applications.Add(financeApp);
    corporation.Applications.Add(flowApp);
    corporation.Applications.Add(mailApp);

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
      ]),
      (websiteApp.Id, "WEBSITE_PORTAL", "Portal Institucional", "Módulo responsável pelas páginas e portal institucional da corporação", [
        ("HOME", "Página Inicial", "Submódulo responsável pela página inicial e catálogo do portal"),
        ("PROFILE", "Perfil Pessoal", "Submódulo responsável pelo gerenciamento de perfil do usuário no portal")
      ]),
      (financeApp.Id, "FINANCE_PAYABLES", "Contas a Pagar", "Controle completo de compromissos financeiros, parcelas e aprovações de pagamento", [
        ("INSTALLMENTS", "Títulos e Parcelas", "Lançamento e acompanhamento de títulos e vencimentos"),
        ("APPROVALS", "Aprovação de Pagamentos", "Alçadas e liberação de pagamentos da empresa"),
        ("SETTLEMENTS", "Baixas, Juros e Multas", "Liquidação parcial ou integral com cálculo automático de encargos")
      ]),
      (financeApp.Id, "FINANCE_RECEIVABLES", "Contas a Receber", "Gestão de recebíveis, cobranças e previsibilidade de entradas", [
        ("BILLING", "Faturamento e Cobranças", "Emissão e controle de títulos a receber"),
        ("RECEIPTS", "Recebimentos e Baixas", "Confirmação de entradas e quitação de clientes")
      ]),
      (financeApp.Id, "FINANCE_INVOICES", "Entrada de Notas Fiscais", "Recebimento automatizado de XML e validação fiscal de compras", [
        ("XML_IMPORT", "Importação de XML", "Leitura automática de notas fiscais eletrônicas"),
        ("TAX_RULES", "Natureza de Operação e Tributos", "Regras fiscais e integração direta com o Contas a Pagar")
      ]),
      (financeApp.Id, "FINANCE_RECONCILIATION", "Conciliação Bancária", "Integração de contas bancárias, extratos e fluxo de caixa em tempo real", [
        ("CNAB", "Remessa e Retorno CNAB", "Processamento automatizado de arquivos bancários"),
        ("CASH_FLOW", "Fluxo de Caixa", "Visão consolidada do previsto vs. realizado por unidade")
      ]),
      (crmApp.Id, "CRM_CUSTOMERS", "Clientes e Relacionamento", "Base unificada de clientes, contatos e histórico comercial", [
        ("PORTFOLIO", "Carteira de Clientes", "Gestão de contas e contatos comerciais"),
        ("INTERACTIONS", "Histórico de Atendimentos", "Registro de reuniões, chamadas e acompanhamentos")
      ]),
      (crmApp.Id, "CRM_PIPELINE", "Funil de Vendas", "Acompanhamento de oportunidades e propostas comerciais", [
        ("OPPORTUNITIES", "Oportunidades", "Etapas do funil e previsão de fechamento"),
        ("PROPOSALS", "Propostas e Orçamentos", "Elaboração e envio de propostas comerciais")
      ]),
      (kalupaApp.Id, "KALUPA_KNOWLEDGE", "Estruturação de Conhecimento", "Organização inteligente de documentos e entrega na pasta local", [
        ("AI_CAPTURE", "Captura e Formatação IA", "Estruturação automática de conteúdos e resumos"),
        ("TEMPLATES", "Templates Inteligentes", "Modelos personalizados da empresa"),
        ("LOCAL_SYNC", "Sincronização na Pasta Local", "Entrega invisível dos documentos aprovados no computador")
      ]),
      (flowApp.Id, "FLOW_ENGINE", "Motor de Workflows", "Automação visual de processos, alçadas de aprovação e gatilhos entre módulos", [
        ("WORKFLOW_BUILDER", "Construtor Visual", "Desenho de fluxos com etapas, condições e aprovações"),
        ("APPROVAL_QUEUES", "Filas de Aprovação", "Caixa de entrada de decisões por alçada e departamento")
      ]),
      (mailApp.Id, "MAIL_DELIVERY", "Disparo Transacional", "Envio de e-mails transacionais, templates HTML e domínios autenticados", [
        ("DOMAINS", "Domínios Verificados", "Configuração de SPF, DKIM e DMARC da corporação"),
        ("TEMPLATES", "Templates de E-mail", "Modelos HTML dinâmicos com variáveis")
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
      (financeApp.Id, "Visão Geral", "Visão Geral", "chart-no-axes-combined", "jade", 0, "Painel inicial do Morphus Financeiro", [
        ("Dashboard", "Dashboard", "Visão geral financeira carregada dinamicamente do banco de dados")
      ]),
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

      // MORPHUS FLOW
      (flowApp.Id, "Motor de Workflows", "Workflows", "workflow", "violet", 1, "Automação visual de processos, alçadas de aprovação e gatilhos entre departamentos", [
        ("Construtor Visual", "Construtor Visual", "Desenho de fluxos com etapas, condições e aprovações"),
        ("Filas de Aprovação", "Aprovações", "Caixa de entrada de decisões por alçada e departamento")
      ]),

      // MORPHUS MAIL
      (mailApp.Id, "Disparo Transacional", "E-mails", "mail", "jade", 1, "Envio de e-mails transacionais, templates HTML e domínios autenticados", [
        ("Domínios Verificados", "Domínios", "Configuração de SPF, DKIM e DMARC da corporação"),
        ("Templates de E-mail", "Templates", "Modelos HTML dinâmicos com variáveis")
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
        var isFinanceDashboard = appModDef.AppId == financeApp.Id && subDef.SubName == "Dashboard";
        var slug = subDef.SubName
            .ToLowerInvariant()
            .Replace("á", "a").Replace("à", "a").Replace("ã", "a").Replace("â", "a")
            .Replace("é", "e").Replace("ê", "e")
            .Replace("í", "i")
            .Replace("ó", "o").Replace("ô", "o").Replace("õ", "o")
            .Replace("ú", "u").Replace("ç", "c")
            .Replace(",", "")
            .Replace(" ", "-");

        var appSub = new ApplicationSubModule
        {
          Id = Guid.NewGuid(),
          CorporationId = corporationId,
          ApplicationModuleId = appMod.Id,
          Name = subDef.SubName,
          Label = subDef.SubLabel,
          Color = appModDef.Color,
          Order = subOrder++,
          RoutePattern = isFinanceDashboard ? "dashboard" : slug,
          Default = isFinanceDashboard,
          HtmlContent = isFinanceDashboard
              ? "<div class=\"rounded-3xl border border-jade-a5 bg-jade-a2 p-8 shadow-sm\"><div class=\"inline-flex items-center gap-2 rounded-full bg-jade-a3 px-3 py-1 text-xs font-semibold text-jade-a11\">Carregado do Banco de Dados PostgreSQL</div><h1 class=\"mt-4 text-2xl font-bold text-neutral-12\">Bem-vindo ao Dashboard do Morphus Finanças!</h1><p class=\"mt-2 text-base text-neutral-a11\">Esta frase e este HTML estão vindo diretamente da tabela <strong>mpx_application_sub_modules (html_content)</strong> através da rota curinga <code>/morphus/app/:appKey/**</code>.</p></div>"
              : $"<div class=\"rounded-3xl border border-neutral-a4 bg-neutral-1 p-8 shadow-sm\"><h1 class=\"text-xl font-bold text-neutral-12\">{subDef.SubLabel}</h1><p class=\"mt-2 text-sm text-neutral-a11\">{subDef.SubDesc} — Conteúdo HTML carregado diretamente do banco de dados.</p></div>",
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

    // 6. Menus Iniciais no Banco apontando para ApplicationId (organizados por seção pai e Order)
    var (corpMod, corpSub) = subModuleLookup[("CORPORATION", "REGISTER")];
    var (wsMod, wsSub) = subModuleLookup[("WORKSPACE", "REGISTER")];
    var (appModRef, appSubRef) = subModuleLookup[("APPLICATION", "REGISTER")];
    var (moduleMod, moduleSub) = subModuleLookup[("MODULE", "REGISTER")];
    var (userMod, userSub) = subModuleLookup[("USER", "REGISTER")];
    var (userRoleMod, userRoleSub) = subModuleLookup[("USER", "USER_ROLE")];
    var (roleRegMod, roleRegSub) = subModuleLookup[("ROLE", "REGISTER")];
    var (claimRegMod, claimRegSub) = subModuleLookup[("CLAIM", "REGISTER")];
    var (portalMod, portalHomeSub) = subModuleLookup[("WEBSITE_PORTAL", "HOME")];

    Menu CreateParentMenu(Guid applicationId, string label, string icon, int order, string description) =>
      new()
      {
        Id = Guid.NewGuid(),
        CorporationId = corporationId,
        ApplicationId = applicationId,
        Label = label,
        Icon = icon,
        Order = order,
        System = true,
        Description = description
      };

    Menu CreateChildMenu(Guid applicationId, Guid parentId, Guid? modId, Guid? subId, string label, string url, string icon, int order, string description) =>
      new()
      {
        Id = Guid.NewGuid(),
        CorporationId = corporationId,
        ApplicationId = applicationId,
        MenuId = parentId,
        ModuleId = modId,
        SubModuleId = subId,
        Label = label,
        Url = url,
        Icon = icon,
        Order = order,
        System = true,
        Description = description
      };

    // 6A. Menus da Aplicação MORPHUS (/morphus)
    var morphusOverviewSection = CreateParentMenu(morphusApp.Id, "Visão Geral", "chart-no-axes-combined", 1, "Visão geral da corporação e do portal");
    var morphusPlatformSection = CreateParentMenu(morphusApp.Id, "Estrutura & Ambientes", "building-2", 2, "Corporações, workspaces e aplicações");
    var morphusSecuritySection = CreateParentMenu(morphusApp.Id, "Segurança & Equipe", "shield-check", 3, "Gestão de equipe, perfis e permissões");
    var morphusSettingsSection = CreateParentMenu(morphusApp.Id, "Configurações", "settings", 4, "Configurações da conta e da corporação");

    var morphusMenus = new[]
    {
      morphusOverviewSection,
      CreateChildMenu(morphusApp.Id, morphusOverviewSection.Id, wsMod.Id, wsSub.Id, "Painel Principal", "/morphus", "chart-no-axes-combined", 1, "Painel principal do workspace"),
      CreateChildMenu(morphusApp.Id, morphusOverviewSection.Id, portalMod.Id, portalHomeSub.Id, "Portal da Corporação", "/website/home", "globe", 2, "Portal institucional e catálogo de soluções"),

      morphusPlatformSection,
      CreateChildMenu(morphusApp.Id, morphusPlatformSection.Id, corpMod.Id, corpSub.Id, "Corporações", "/morphus/corporation", "building-2", 1, "Gerenciamento de corporações e filiais do sistema"),
      CreateChildMenu(morphusApp.Id, morphusPlatformSection.Id, wsMod.Id, wsSub.Id, "Workspaces", "/morphus/workspace", "layers", 2, "Gerenciamento dos ambientes de trabalho (workspaces) da corporação"),
      CreateChildMenu(morphusApp.Id, morphusPlatformSection.Id, appModRef.Id, appSubRef.Id, "Aplicações", "/morphus/application", "boxes", 3, "Catálogo e aplicações vinculadas à corporação"),

      morphusSecuritySection,
      CreateChildMenu(morphusApp.Id, morphusSecuritySection.Id, userMod.Id, userSub.Id, "Usuários e Acessos", "/security/user", "users", 1, "Cadastro e gestão de usuários"),
      CreateChildMenu(morphusApp.Id, morphusSecuritySection.Id, roleRegMod.Id, roleRegSub.Id, "Perfis e Permissões", "/security/user-role", "shield", 2, "Perfis de acesso e permissões da equipe"),
      CreateChildMenu(morphusApp.Id, morphusSecuritySection.Id, moduleMod.Id, moduleSub.Id, "Módulos do Sistema", "/security/module", "blocks", 3, "Módulos e submódulos do sistema"),

      morphusSettingsSection,
      CreateChildMenu(morphusApp.Id, morphusSettingsSection.Id, corpMod.Id, corpSub.Id, "Configurações Gerais", "/morphus/settings", "sliders-horizontal", 1, "Configurações gerais do ambiente"),
      CreateChildMenu(morphusApp.Id, morphusSettingsSection.Id, userMod.Id, userSub.Id, "Minha Conta", "/morphus/settings/account", "user", 2, "Dados pessoais da conta"),
      CreateChildMenu(morphusApp.Id, morphusSettingsSection.Id, corpMod.Id, corpSub.Id, "Planos e Faturamento", "/morphus/settings/plan-billing", "wallet", 3, "Assinatura, planos e faturamento"),
      CreateChildMenu(morphusApp.Id, morphusSettingsSection.Id, userMod.Id, userSub.Id, "Segurança da Conta", "/morphus/settings/security", "lock", 4, "Senha e segurança da conta"),
      CreateChildMenu(morphusApp.Id, morphusSettingsSection.Id, userMod.Id, userSub.Id, "Equipe", "/morphus/settings/team", "users", 5, "Membros da equipe"),
      CreateChildMenu(morphusApp.Id, morphusSettingsSection.Id, userMod.Id, userSub.Id, "Notificações", "/morphus/settings/notifications", "bell", 6, "Preferências de notificações")
    };

    // 6B. Menus da Aplicação SEGURANÇA (/security)
    var securityOverviewSection = CreateParentMenu(securityApp.Id, "Visão Geral", "chart-no-axes-combined", 1, "Painel de identidade e segurança");
    var securityAccessSection = CreateParentMenu(securityApp.Id, "Controle de Acesso", "shield-check", 2, "Usuários, perfis, permissões e vínculos");
    var securityModulesSection = CreateParentMenu(securityApp.Id, "Estrutura de Módulos", "blocks", 3, "Módulos, aplicações e workspaces");

    var securityMenus = new[]
    {
      securityOverviewSection,
      CreateChildMenu(securityApp.Id, securityOverviewSection.Id, userMod.Id, userSub.Id, "Painel de Segurança", "/security", "chart-no-axes-combined", 1, "Visão geral de segurança e acessos"),

      securityAccessSection,
      CreateChildMenu(securityApp.Id, securityAccessSection.Id, userMod.Id, userSub.Id, "Usuários", "/security/user", "users", 1, "Gerenciamento de usuários"),
      CreateChildMenu(securityApp.Id, securityAccessSection.Id, roleRegMod.Id, roleRegSub.Id, "Perfis de Acesso (Roles)", "/security/role", "shield", 2, "Gerenciamento de perfis de acesso"),
      CreateChildMenu(securityApp.Id, securityAccessSection.Id, claimRegMod.Id, claimRegSub.Id, "Permissões (Claims)", "/security/claim", "key-round", 3, "Gerenciamento de permissões"),
      CreateChildMenu(securityApp.Id, securityAccessSection.Id, userRoleMod.Id, userRoleSub.Id, "Vínculos e Acessos", "/security/user-role", "user-check", 4, "Vínculos entre usuários, perfis e permissões"),

      securityModulesSection,
      CreateChildMenu(securityApp.Id, securityModulesSection.Id, moduleMod.Id, moduleSub.Id, "Módulos e Submódulos", "/security/module", "blocks", 1, "Módulos e submódulos de segurança"),
      CreateChildMenu(securityApp.Id, securityModulesSection.Id, appModRef.Id, appSubRef.Id, "Aplicações", "/morphus/application", "boxes", 2, "Aplicações da corporação"),
      CreateChildMenu(securityApp.Id, securityModulesSection.Id, wsMod.Id, wsSub.Id, "Workspaces", "/morphus/workspace", "layers", 3, "Workspaces da corporação")
    };

    foreach (var menu in morphusMenus.Concat(securityMenus))
    {
      corporation.Menus.Add(menu);
    }

    // 7. Vínculos Administrativos do existingUserId na Corporation, nas Applications e na Role ADMINISTRATOR
    corporation.CorporationUsers.Add(new CorporationUser
    {
      CorporationId = corporationId,
      UserId = existingUserId,
      IsOwner = true,
      Inactive = false,
      System = true
    });

    foreach (var app in corporation.Applications.Where(a => a.System || a.Id == financeApp.Id))
    {
      corporation.ApplicationUsers.Add(new ApplicationUser
      {
        CorporationId = corporationId,
        ApplicationId = app.Id,
        UserId = existingUserId,
        IsOwner = true,
        Inactive = false,
        System = app.System
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

    foreach (var app in corporation.Applications.Where(a => a.System || a.Prefix == "FIN"))
    {
      corporation.WorkspaceApplications.Add(new WorkspaceApplication
      {
        CorporationId = corporation.Id,
        WorkspaceId = defaultWorkspace.Id,
        ApplicationId = app.Id,
        Default = app.Prefix == "FIN",
        TrialStartDate = app.Prefix == "FIN" ? DateTime.UtcNow : null,
        TrialDays = app.Prefix == "FIN" ? 14 : null,
        TrialUsed = app.Prefix == "FIN",
        Inactive = false,
        System = app.System
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

    foreach (var app in corporation.Applications.Where(a => a.System || a.Prefix == "FIN"))
    {
      corporation.WorkspaceApplications.Add(new WorkspaceApplication
      {
        CorporationId = corporation.Id,
        WorkspaceId = defaultWorkspace.Id,
        ApplicationId = app.Id,
        Default = app.Prefix == "FIN",
        TrialStartDate = app.Prefix == "FIN" ? DateTime.UtcNow : null,
        TrialDays = app.Prefix == "FIN" ? 14 : null,
        TrialUsed = app.Prefix == "FIN",
        Inactive = false,
        System = app.System
      });
    }

    return corporation;
  }

  public static (List<Feature> Features, List<ModuleCategory> ModuleCategories) CreateDefaultShowcaseContent()
  {
    var feature1Id = Guid.NewGuid();
    var feature2Id = Guid.NewGuid();
    var feature3Id = Guid.NewGuid();

    var features = new List<Feature>
    {
      new()
      {
        Id = feature1Id,
        Title = "Uma única conta. Múltiplas corporações, filiais e workspaces.",
        HighlightPhrase = "Arquitetura Multi-Corporação",
        Description = "O Morphus foi desenhado para grupos empresariais reais. Um mesmo usuário pode atuar em diferentes organizações e filiais mantendo cada base de dados 100% isolada e segura.",
        Order = 1,
        System = true,
        Highlights =
        [
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature1Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "layers",
            Highlight = "Hierarquia ilimitada entre Matriz e Filiais com auto-relacionamento nativo",
            HighlightIcon = "check",
            Order = 1,
            System = true
          },
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature1Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "layers",
            Highlight = "Workspaces e aplicações sob medida para cada departamento",
            HighlightIcon = "check",
            Order = 2,
            System = true
          },
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature1Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "layers",
            Highlight = "Menus dinâmicos montados automaticamente conforme o perfil de acesso",
            HighlightIcon = "check",
            Order = 3,
            System = true
          }
        ]
      },
      new()
      {
        Id = feature2Id,
        Title = "Da importação da nota fiscal até a conciliação bancária.",
        HighlightPhrase = "Operação Fiscal & Financeira",
        Description = "Elimine retrabalho manual. Ao dar entrada em uma nota fiscal, o Morphus já alimenta o estoque, aplica as regras de tributação e gera as provisões no contas a pagar.",
        Order = 2,
        System = true,
        Highlights =
        [
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature2Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "sparkles",
            Highlight = "Importação automática de notas fiscais e vínculo com natureza de operação",
            HighlightIcon = "check",
            Order = 1,
            System = true
          },
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature2Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "sparkles",
            Highlight = "Geração de remessas e leitura de retornos bancários (CNAB)",
            HighlightIcon = "check",
            Order = 2,
            System = true
          },
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature2Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "sparkles",
            Highlight = "Motor próprio de disparo de e-mails transacionais com templates HTML",
            HighlightIcon = "check",
            Order = 3,
            System = true
          }
        ]
      },
      new()
      {
        Id = feature3Id,
        Title = "Na nuvem compartilhada ou dedicado no seu próprio servidor.",
        HighlightPhrase = "Flexibilidade de Infraestrutura",
        Description = "Comece imediatamente no Morphus Cloud com isolamento total por corporação ou publique toda a stack containerizada na infraestrutura privada da sua empresa.",
        Order = 3,
        System = true,
        Highlights =
        [
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature3Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "server",
            Highlight = "Arquitetura limpa (.NET Clean Architecture + Angular) pronta para containers",
            HighlightIcon = "check",
            Order = 1,
            System = true
          },
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature3Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "server",
            Highlight = "Autenticação blindada com JWT, OAuth 2.0 e Login com Google",
            HighlightIcon = "check",
            Order = 2,
            System = true
          },
          new FeatureHighlight
          {
            Id = Guid.NewGuid(),
            FeatureId = feature3Id,
            Title = "Destaques da arquitetura",
            TitleIcon = "server",
            Highlight = "Alta performance e zero dependência de renderização bloqueante",
            HighlightIcon = "check",
            Order = 3,
            System = true
          }
        ]
      }
    };

    var catSec = new ModuleCategory { Id = Guid.NewGuid(), Name = "Segurança", Color = "violet", Order = 1, System = true };
    var catCorp = new ModuleCategory { Id = Guid.NewGuid(), Name = "Corporativo", Color = "indigo", Order = 2, System = true };
    var catFisc = new ModuleCategory { Id = Guid.NewGuid(), Name = "Fiscal", Color = "jade", Order = 3, System = true };
    var catCore = new ModuleCategory { Id = Guid.NewGuid(), Name = "Core ERP", Color = "amber", Order = 4, System = true };
    var catFin = new ModuleCategory { Id = Guid.NewGuid(), Name = "Financeiro", Color = "violet", Order = 5, System = true };
    var catBank = new ModuleCategory { Id = Guid.NewGuid(), Name = "Bancário", Color = "indigo", Order = 6, System = true };
    var catAnalytics = new ModuleCategory { Id = Guid.NewGuid(), Name = "Analytics", Color = "jade", Order = 7, System = true };
    var catAssets = new ModuleCategory { Id = Guid.NewGuid(), Name = "Ativos", Color = "amber", Order = 8, System = true };

    catSec.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catSec.Id,
      Icon = "shield-check",
      Title = "Acessos e Permissões",
      Description = "Gestão granular de usuários, perfis e permissões isolados por corporação, filial, workspace e aplicação.",
      ActionText = "Experimentar",
      Order = 1,
      System = true
    });

    catCorp.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catCorp.Id,
      Icon = "building-2",
      Title = "Corporações e Filiais",
      Description = "Estrutura hierárquica entre matriz e múltiplas filiais, permitindo alternar de ambiente com apenas um clique.",
      ActionText = "Experimentar",
      Order = 2,
      System = true
    });

    catFisc.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catFisc.Id,
      Icon = "file-text",
      Title = "Entrada de Notas Fiscais",
      Description = "Importação automática de XML e lançamento de notas fiscais de compra com validação de natureza de operação e tributação.",
      ActionText = "Experimentar",
      Order = 3,
      System = true
    });

    catCore.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catCore.Id,
      Icon = "boxes",
      Title = "Cadastros Inteligentes",
      Description = "Produtos, categorias, fornecedores, contas bancárias, contas caixa e naturezas de operação centralizados e padronizados.",
      ActionText = "Experimentar",
      Order = 4,
      System = true
    });

    catFin.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catFin.Id,
      Icon = "wallet",
      Title = "Contas a Pagar e Receber",
      Description = "Controle completo de títulos, vencimentos, baixas parciais ou integrais, juros, multas e previsibilidade financeira.",
      ActionText = "Experimentar",
      Order = 5,
      System = true
    });

    catBank.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catBank.Id,
      Icon = "landmark",
      Title = "Conciliação e CNAB",
      Description = "Integração bancária com processamento de arquivos CNAB de remessa e retorno e conciliação automatizada de extratos.",
      ActionText = "Experimentar",
      Order = 6,
      System = true
    });

    catAnalytics.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catAnalytics.Id,
      Icon = "chart-no-axes-combined",
      Title = "Fluxo de Caixa em Tempo Real",
      Description = "Visão consolidada por filial ou grupo econômico das entradas e saídas realizadas e projetadas por centro de custo.",
      ActionText = "Experimentar",
      Order = 7,
      System = true
    });

    catAssets.Modules.Add(new ShowcaseModule
    {
      Id = Guid.NewGuid(),
      CategoryId = catAssets.Id,
      Icon = "truck",
      Title = "Frotas e Patrimônio",
      Description = "Controle do imobilizado, veículos da corporação, manutenções e cálculo automatizado de depreciação mensal.",
      ActionText = "Experimentar",
      Order = 8,
      System = true
    });

    var categories = new List<ModuleCategory> { catSec, catCorp, catFisc, catCore, catFin, catBank, catAnalytics, catAssets };
    return (features, categories);
  }
}
