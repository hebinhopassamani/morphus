using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;

namespace Mpx.Infrastructure.Data.Repositories;

public class WorkspaceRepository(MorphusDbContext context) : MorphusRepository<Workspace>(context), IWorkspaceRepository
{
  private static bool _trialSchemaEnsured;

  private async Task EnsureTrialSchemaAndBackfillAsync()
  {
    if (_trialSchemaEnsured)
      return;

    try
    {
      await _context.Database.ExecuteSqlRawAsync(@"
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_days integer NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS shared_with_workspace_id uuid NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS ""default"" boolean NOT NULL DEFAULT false;

        UPDATE mpx_applications
        SET system = false
        WHERE UPPER(name) NOT IN ('MORPHUS', 'SEGURANÇA', 'SEGURANCA', 'SECURITY', 'WEBSITE');
      ");
      _trialSchemaEnsured = true;
    }
    catch
    {
      // Ignora caso o banco ainda esteja em inicialização
    }
  }

  public async Task<List<Workspace>> GetListAsync()
  {
    await EnsureTrialSchemaAndBackfillAsync();
    await EnsureCorporationCatalogBackfillAsync();
    await EnsureFinanceiroProvisionedAndDashboardHtmlAsync();

    return await _context.Workspaces
        .AsNoTracking()
        .Include(w => w.WorkspaceApplications.Where(wa => !wa.Inactive))
          .ThenInclude(wa => wa.Application)
            .ThenInclude(a => a!.Category)
        .Include(w => w.WorkspaceApplications.Where(wa => !wa.Inactive))
          .ThenInclude(wa => wa.Application)
            .ThenInclude(a => a!.ApplicationStatus)
        .Include(w => w.WorkspaceApplications.Where(wa => !wa.Inactive))
          .ThenInclude(wa => wa.Application)
            .ThenInclude(a => a!.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
              .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .OrderByDescending(w => w.Default)
        .ThenBy(w => w.Name)
        .ToListAsync();
  }

  private async Task EnsureCorporationCatalogBackfillAsync()
  {
    var defaultWs = await _context.Workspaces
        .OrderByDescending(w => w.Default)
        .FirstOrDefaultAsync();

    if (defaultWs is null || defaultWs.CorporationId == Guid.Empty)
      return;

    var corporationId = defaultWs.CorporationId;

    var hasCategories = await _context.Categories.AnyAsync();
    var hasAppModules = await _context.ApplicationModules.AnyAsync();
    if (hasCategories && hasAppModules)
      return;

    Category? managementCategory;
    Category? securityCategory;
    Category? portalCategory;
    Category? automationCategory;
    Category? commercialCategory;
    Category? financeCategory;

    ApplicationStatus? appActiveStatus;
    ApplicationStatus? appPreparingStatus;

    if (!hasCategories)
    {
      managementCategory = new Category { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Gestão Empresarial", Label = "Gestão", Color = "violet", System = true, Description = "Aplicações centrais de administração, estrutura corporativa e governança" };
      securityCategory = new Category { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Segurança e Identidade", Label = "Segurança", Color = "indigo", System = true, Description = "Controle de equipe, perfis de acesso e permissões" };
      portalCategory = new Category { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Portal e Institucional", Label = "Portal", Color = "jade", System = true, Description = "Portal central do cliente e páginas institucionais" };
      automationCategory = new Category { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Automação e Conhecimento", Label = "Automação", Color = "amber", System = true, Description = "Estruturação inteligente de documentos e fluxos em segundo plano" };
      commercialCategory = new Category { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Comercial e Vendas", Label = "Comercial", Color = "indigo", System = true, Description = "Relacionamento com clientes, propostas e funil de vendas" };
      financeCategory = new Category { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Finanças e Fiscal", Label = "Finanças", Color = "jade", System = true, Description = "Notas fiscais, contas a pagar, contas a receber e conciliação bancária" };

      await _context.Categories.AddRangeAsync(managementCategory, securityCategory, portalCategory, automationCategory, commercialCategory, financeCategory);

      appActiveStatus = new ApplicationStatus { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Ativa", Label = "Disponível", Color = "jade", System = true, Description = "Tudo pronto para você usar" };
      appPreparingStatus = new ApplicationStatus { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Em preparação", Label = "Sendo preparada", Color = "amber", System = true, Description = "Estamos preparando tudo para você" };
      var appTrialStatus = new ApplicationStatus { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Em avaliação", Label = "Experimentando", Color = "violet", System = true, Description = "Aproveite para conhecer todos os recursos" };
      var appBlockedStatus = new ApplicationStatus { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Bloqueada", Label = "Aguardando você", Color = "amber", System = true, Description = "Confira os detalhes da sua conta para continuar usando" };
      var appInactiveStatus = new ApplicationStatus { Id = Guid.NewGuid(), CorporationId = corporationId, Name = "Inativa", Label = "Pausada", Color = "slate", System = true, Description = "Pausada no momento — reative quando quiser" };

      await _context.ApplicationStatuses.AddRangeAsync(appActiveStatus, appPreparingStatus, appTrialStatus, appBlockedStatus, appInactiveStatus);
    }
    else
    {
      var cats = await _context.Categories.ToListAsync();
      managementCategory = cats.FirstOrDefault(c => c.Label == "Gestão") ?? cats.First();
      securityCategory = cats.FirstOrDefault(c => c.Label == "Segurança") ?? cats.First();
      portalCategory = cats.FirstOrDefault(c => c.Label == "Portal") ?? cats.First();
      automationCategory = cats.FirstOrDefault(c => c.Label == "Automação") ?? cats.First();
      commercialCategory = cats.FirstOrDefault(c => c.Label == "Comercial") ?? cats.First();
      financeCategory = cats.FirstOrDefault(c => c.Label == "Finanças") ?? cats.First();

      var statuses = await _context.ApplicationStatuses.ToListAsync();
      appActiveStatus = statuses.FirstOrDefault(s => s.Name == "Ativa") ?? statuses.First();
      appPreparingStatus = statuses.FirstOrDefault(s => s.Name == "Em preparação") ?? statuses.First();
    }

    var existingApps = await _context.Applications.ToListAsync();
    foreach (var app in existingApps)
    {
      var lower = app.Name.ToLowerInvariant();
      if (lower.Contains("segur") || lower.Contains("security"))
      {
        app.CategoryId ??= securityCategory.Id;
        app.ApplicationStatusId ??= appActiveStatus.Id;
        app.Color ??= "indigo";
      }
      else if (lower.Contains("web") || lower.Contains("site"))
      {
        app.CategoryId ??= portalCategory.Id;
        app.ApplicationStatusId ??= appActiveStatus.Id;
        app.Color ??= "jade";
      }
      else if (lower.Contains("kalupa"))
      {
        app.CategoryId ??= automationCategory.Id;
        app.ApplicationStatusId ??= appPreparingStatus.Id;
        app.Color ??= "amber";
      }
      else if (lower.Contains("crm"))
      {
        app.CategoryId ??= commercialCategory.Id;
        app.ApplicationStatusId ??= appPreparingStatus.Id;
        app.Color ??= "indigo";
      }
      else if (lower.Contains("financ"))
      {
        app.CategoryId ??= financeCategory.Id;
        app.ApplicationStatusId ??= appActiveStatus.Id;
        app.Color ??= "jade";
      }
      else
      {
        app.CategoryId ??= managementCategory.Id;
        app.ApplicationStatusId ??= appActiveStatus.Id;
        app.Color ??= "violet";
      }
    }

    var newApps = new List<MorphusApplication>();

    var kalupaApp = existingApps.FirstOrDefault(a => a.Name.Contains("Kalupa", StringComparison.OrdinalIgnoreCase));
    if (kalupaApp is null)
    {
      kalupaApp = new MorphusApplication
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
      newApps.Add(kalupaApp);
    }

    var crmApp = existingApps.FirstOrDefault(a => a.Name.Contains("CRM", StringComparison.OrdinalIgnoreCase));
    if (crmApp is null)
    {
      crmApp = new MorphusApplication
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
      newApps.Add(crmApp);
    }

    var financeApp = existingApps.FirstOrDefault(a => a.Name.Contains("Financeiro", StringComparison.OrdinalIgnoreCase));
    if (financeApp is null)
    {
      financeApp = new MorphusApplication
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
      newApps.Add(financeApp);
    }

    if (newApps.Count > 0)
    {
      await _context.Applications.AddRangeAsync(newApps);
    }

    if (!hasAppModules)
    {
      var apMod = new ApplicationModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationId = financeApp.Id, Name = "Contas a Pagar", Label = "Contas a Pagar", Icon = "wallet", Color = "jade", Order = 1, System = true, Description = "Controle completo de compromissos financeiros, parcelas e aprovações de pagamento" };
      var arMod = new ApplicationModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationId = financeApp.Id, Name = "Contas a Receber", Label = "Contas a Receber", Icon = "landmark", Color = "jade", Order = 2, System = true, Description = "Gestão de recebíveis, cobranças e previsibilidade de entradas" };
      var invMod = new ApplicationModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationId = financeApp.Id, Name = "Entrada de Notas Fiscais", Label = "Entrada de Notas", Icon = "file-text", Color = "jade", Order = 3, System = true, Description = "Recebimento automatizado de XML e validação fiscal de compras" };
      var bankMod = new ApplicationModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationId = financeApp.Id, Name = "Conciliação Bancária", Label = "Conciliação Bancária", Icon = "chart-no-axes-combined", Color = "jade", Order = 4, System = true, Description = "Integração de contas bancárias, extratos e fluxo de caixa em tempo real" };

      var crmCustomersMod = new ApplicationModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationId = crmApp.Id, Name = "Clientes e Relacionamento", Label = "Clientes", Icon = "users", Color = "indigo", Order = 1, System = true, Description = "Base unificada de clientes, contatos e histórico comercial" };
      var crmPipelineMod = new ApplicationModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationId = crmApp.Id, Name = "Funil de Vendas", Label = "Funil de Vendas", Icon = "sparkles", Color = "indigo", Order = 2, System = true, Description = "Acompanhamento de oportunidades e propostas comerciais" };

      var kalupaMod = new ApplicationModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationId = kalupaApp.Id, Name = "Estruturação de Conhecimento", Label = "Conhecimento IA", Icon = "workflow", Color = "amber", Order = 1, System = true, Description = "Organização inteligente de documentos e entrega na pasta local" };

      await _context.ApplicationModules.AddRangeAsync(apMod, arMod, invMod, bankMod, crmCustomersMod, crmPipelineMod, kalupaMod);

      await _context.ApplicationSubModules.AddRangeAsync(
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = apMod.Id, Name = "Títulos e Parcelas", Label = "Títulos e Parcelas", Color = "jade", Order = 1, System = true, Description = "Lançamento e acompanhamento de títulos e vencimentos" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = apMod.Id, Name = "Aprovação de Pagamentos", Label = "Aprovação de Pagamentos", Color = "jade", Order = 2, System = true, Description = "Alçadas e liberação de pagamentos da empresa" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = apMod.Id, Name = "Baixas, Juros e Multas", Label = "Baixas, Juros e Multas", Color = "jade", Order = 3, System = true, Description = "Liquidação parcial ou integral com cálculo automático de encargos" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = arMod.Id, Name = "Faturamento e Cobranças", Label = "Faturamento e Cobranças", Color = "jade", Order = 1, System = true, Description = "Emissão e controle de títulos a receber" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = arMod.Id, Name = "Recebimentos e Baixas", Label = "Recebimentos e Baixas", Color = "jade", Order = 2, System = true, Description = "Confirmação de entradas e quitação de clientes" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = invMod.Id, Name = "Importação de XML", Label = "Importação de XML", Color = "jade", Order = 1, System = true, Description = "Leitura automática de notas fiscais eletrônicas" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = invMod.Id, Name = "Natureza de Operação e Tributos", Label = "Natureza e Tributos", Color = "jade", Order = 2, System = true, Description = "Regras fiscais e integração direta com o Contas a Pagar" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = bankMod.Id, Name = "Remessa e Retorno CNAB", Label = "Remessa e Retorno CNAB", Color = "jade", Order = 1, System = true, Description = "Processamento automatizado de arquivos bancários" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = bankMod.Id, Name = "Fluxo de Caixa", Label = "Fluxo de Caixa", Color = "jade", Order = 2, System = true, Description = "Visão consolidada do previsto vs. realizado por unidade" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = crmCustomersMod.Id, Name = "Carteira de Clientes", Label = "Carteira de Clientes", Color = "indigo", Order = 1, System = true, Description = "Gestão de contas e contatos comerciais" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = crmCustomersMod.Id, Name = "Histórico de Atendimentos", Label = "Histórico de Atendimentos", Color = "indigo", Order = 2, System = true, Description = "Registro de reuniões, chamadas e acompanhamentos" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = crmPipelineMod.Id, Name = "Oportunidades", Label = "Oportunidades", Color = "indigo", Order = 1, System = true, Description = "Etapas do funil e previsão de fechamento" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = crmPipelineMod.Id, Name = "Propostas e Orçamentos", Label = "Propostas e Orçamentos", Color = "indigo", Order = 2, System = true, Description = "Elaboração e envio de propostas comerciais" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = kalupaMod.Id, Name = "Captura e Formatação IA", Label = "Captura IA", Color = "amber", Order = 1, System = true, Description = "Estruturação automática de conteúdos e resumos" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = kalupaMod.Id, Name = "Templates Inteligentes", Label = "Templates", Color = "amber", Order = 2, System = true, Description = "Modelos personalizados da empresa" },
        new ApplicationSubModule { Id = Guid.NewGuid(), CorporationId = corporationId, ApplicationModuleId = kalupaMod.Id, Name = "Sincronização na Pasta Local", Label = "Pasta Local", Color = "amber", Order = 3, System = true, Description = "Entrega invisível dos documentos aprovados no computador" }
      );
    }

    await _context.SaveChangesAsync();
  }

  private async Task EnsureFinanceiroProvisionedAndDashboardHtmlAsync()
  {
    var defaultWs = await _context.Workspaces
        .OrderByDescending(w => w.Default)
        .FirstOrDefaultAsync(w => !w.Inactive);

    if (defaultWs is null || defaultWs.CorporationId == Guid.Empty)
      return;

    var corporationId = defaultWs.CorporationId;
    var financeApp = await _context.Applications
        .FirstOrDefaultAsync(a => a.Prefix == "FIN" || a.Name.Contains("Financeiro") || a.Name.Contains("Finanças"));

    if (financeApp is null)
      return;

    var changed = false;

    if (!financeApp.Default)
    {
      financeApp.Default = true;
      changed = true;
    }

    var wsLink = await _context.WorkspaceApplications
        .FirstOrDefaultAsync(wa => wa.WorkspaceId == defaultWs.Id && wa.ApplicationId == financeApp.Id);

    if (wsLink is null)
    {
      _context.WorkspaceApplications.Add(new WorkspaceApplication
      {
        CorporationId = corporationId,
        WorkspaceId = defaultWs.Id,
        ApplicationId = financeApp.Id,
        Default = true,
        TrialStartDate = DateTime.UtcNow,
        TrialDays = 14,
        TrialUsed = true,
        Inactive = false,
        System = false
      });
      changed = true;
    }
    else if (wsLink.Inactive || !wsLink.TrialUsed)
    {
      wsLink.Inactive = false;
      wsLink.Default = true;
      wsLink.TrialUsed = true;
      wsLink.TrialStartDate ??= DateTime.UtcNow;
      wsLink.TrialDays ??= 14;
      changed = true;
    }

    var overviewMod = await _context.ApplicationModules
        .FirstOrDefaultAsync(m => m.ApplicationId == financeApp.Id && m.Name == "Visão Geral");

    if (overviewMod is null)
    {
      overviewMod = new ApplicationModule
      {
        Id = Guid.NewGuid(),
        CorporationId = corporationId,
        ApplicationId = financeApp.Id,
        Name = "Visão Geral",
        Label = "Visão Geral",
        Icon = "chart-no-axes-combined",
        Color = "jade",
        Order = 0,
        System = true,
        Description = "Painel inicial do Morphus Financeiro"
      };
      _context.ApplicationModules.Add(overviewMod);
      changed = true;
    }

    var dashboardSub = await _context.ApplicationSubModules
        .FirstOrDefaultAsync(sm => sm.ApplicationModuleId == overviewMod.Id && sm.Name == "Dashboard");

    var (dashRoute, dashDefault, defaultDashboardHtml) =
        MorphusFinanceiroTemplates.ResolveForSubModule("Dashboard", "Dashboard", "Visão geral financeira");

    if (dashboardSub is null)
    {
      dashboardSub = new ApplicationSubModule
      {
        Id = Guid.NewGuid(),
        CorporationId = corporationId,
        ApplicationModuleId = overviewMod.Id,
        Name = "Dashboard",
        Label = "Dashboard",
        Icon = "chart-no-axes-combined",
        Color = "jade",
        Order = 1,
        RoutePattern = dashRoute,
        Default = dashDefault,
        HtmlContent = defaultDashboardHtml,
        System = true,
        Description = "Visão geral financeira carregada dinamicamente do banco de dados"
      };
      _context.ApplicationSubModules.Add(dashboardSub);
      changed = true;
    }
    else if (string.IsNullOrWhiteSpace(dashboardSub.HtmlContent) ||
             string.IsNullOrWhiteSpace(dashboardSub.RoutePattern) ||
             dashboardSub.HtmlContent.Contains("Bem-vindo ao Dashboard do Morphus Finanças!"))
    {
      dashboardSub.RoutePattern = dashRoute;
      dashboardSub.Default = dashDefault;
      dashboardSub.HtmlContent = defaultDashboardHtml;
      changed = true;
    }

    var otherSubs = await _context.ApplicationSubModules
        .Include(sm => sm.ApplicationModule)
        .Where(sm => sm.ApplicationModule!.ApplicationId == financeApp.Id && sm.Id != dashboardSub.Id)
        .ToListAsync();

    foreach (var sub in otherSubs)
    {
      var (resolvedRoute, _, resolvedHtml) =
          MorphusFinanceiroTemplates.ResolveForSubModule(sub.Name, sub.Label, sub.Description);

      if (string.IsNullOrWhiteSpace(sub.RoutePattern))
      {
        sub.RoutePattern = resolvedRoute;
        changed = true;
      }
      if (string.IsNullOrWhiteSpace(sub.HtmlContent) ||
          sub.HtmlContent.Contains("Conteúdo HTML carregado diretamente do banco de dados."))
      {
        sub.HtmlContent = resolvedHtml;
        changed = true;
      }
    }

    if (changed)
    {
      await _context.SaveChangesAsync();
    }
  }

  public async Task<Workspace?> GetByKeyAsync(string key)
  {
    return await _context.Workspaces
        .AsNoTracking()
        .Include(w => w.WorkspaceApplications.Where(wa => !wa.Inactive))
          .ThenInclude(wa => wa.Application)
        .FirstOrDefaultAsync(w => w.Key == key);
  }

  public async Task ClearDefaultsExceptAsync(Guid excludeWorkspaceId)
  {
    var currentDefaults = await _context.Workspaces
        .Where(w => w.Default && w.Id != excludeWorkspaceId)
        .ToListAsync();

    if (currentDefaults.Count == 0)
      return;

    foreach (var ws in currentDefaults)
    {
      ws.Default = false;
    }

    await _context.SaveChangesAsync();
  }

  public async Task EnsureDefaultWorkspaceExistsAsync(Guid? preferredFallbackId = null)
  {
    var hasDefault = await _context.Workspaces.AnyAsync(w => w.Default && !w.Inactive);
    if (hasDefault)
      return;

    Workspace? fallback = null;
    if (preferredFallbackId.HasValue && preferredFallbackId.Value != Guid.Empty)
    {
      fallback = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == preferredFallbackId.Value && !w.Inactive);
    }

    fallback ??= await _context.Workspaces
        .OrderByDescending(w => w.System)
        .ThenBy(w => w.Name)
        .FirstOrDefaultAsync(w => !w.Inactive);

    if (fallback is not null)
    {
      fallback.Default = true;
      await _context.SaveChangesAsync();
    }
  }
}
