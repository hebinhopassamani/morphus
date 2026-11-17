using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class ApplicationRepository(MorphusDbContext context) : MorphusRepository<MorphusApplication>(context), IApplicationRepository
{
  public override async Task<MorphusApplication?> GetByIdAsync(Guid id)
  {
    var app = await _context.Applications
        .AsNoTracking()
        .Include(a => a.Corporation)
        .Include(a => a.CorporationDomain)
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
        .Include(a => a.WorkspaceApplications)
        .Include(a => a.ApplicationSettings.Where(s => !s.Inactive).OrderBy(s => s.Order))
        .Include(a => a.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
          .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .FirstOrDefaultAsync(a => a.Id == id);

    if (app is not null)
    {
      app.WorkspaceIds = app.WorkspaceApplications
          .Where(wa => !wa.Inactive)
          .Select(wa => wa.WorkspaceId)
          .Distinct()
          .ToList();
    }

    return app;
  }

  public async Task<List<MorphusApplication>> GetListAsync()
  {
    var list = await _context.Applications
        .AsNoTracking()
        .Include(a => a.Corporation)
        .Include(a => a.CorporationDomain)
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
        .Include(a => a.WorkspaceApplications)
        .Include(a => a.ApplicationSettings.Where(s => !s.Inactive).OrderBy(s => s.Order))
        .Include(a => a.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
          .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .OrderBy(a => a.Name)
        .ToListAsync();

    foreach (var app in list)
    {
      app.WorkspaceIds = app.WorkspaceApplications
          .Where(wa => !wa.Inactive)
          .Select(wa => wa.WorkspaceId)
          .Distinct()
          .ToList();
    }

    return list;
  }

  public async Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId)
  {
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Corporation)
        .Include(a => a.CorporationDomain)
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
        .Include(a => a.ApplicationSettings.Where(s => !s.Inactive).OrderBy(s => s.Order))
        .Include(a => a.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
          .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .Where(a => !a.Inactive && a.WorkspaceApplications.Any(wa => wa.WorkspaceId == workspaceId && !wa.Inactive))
        .OrderBy(a => a.Name)
        .ToListAsync();
  }

  public async Task<MorphusApplication?> GetByKeyAsync(string key)
  {
    var clean = (key ?? string.Empty).Trim().ToUpperInvariant();
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Corporation)
        .Include(a => a.CorporationDomain)
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
        .Include(a => a.ApplicationSettings.Where(s => !s.Inactive).OrderBy(s => s.Order))
        .Include(a => a.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
          .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .FirstOrDefaultAsync(a => a.Key.ToUpper() == clean || a.Prefix.ToUpper() == clean);
  }

  public async Task<List<Category>> GetCategoriesAsync()
  {
    return await _context.Categories
        .AsNoTracking()
        .Where(c => !c.Inactive)
        .OrderBy(c => c.Name)
        .ToListAsync();
  }

  public async Task EnsureInitialWorkspaceAndDashboardForNewAppAsync(MorphusApplication application)
  {
    var defaultWs = await _context.Workspaces
        .OrderByDescending(w => w.Default)
        .FirstOrDefaultAsync(w => !w.Inactive);

    if (defaultWs is not null)
    {
      var corporationId = defaultWs.CorporationId;
      if (application.CorporationId == Guid.Empty)
      {
        application.CorporationId = corporationId;
      }

      if (application.ApplicationStatusId is null || application.ApplicationStatusId == Guid.Empty)
      {
        var activeStatus = await _context.ApplicationStatuses
            .FirstOrDefaultAsync(s => s.Name == "Ativa");
        if (activeStatus is not null)
        {
          application.ApplicationStatusId = activeStatus.Id;
        }
      }

      var targetWorkspaceIds = (application.WorkspaceIds ?? [])
          .Where(id => id != Guid.Empty)
          .Distinct()
          .ToList();

      if (targetWorkspaceIds.Count == 0)
      {
        targetWorkspaceIds.Add(defaultWs.Id);
      }

      foreach (var wsId in targetWorkspaceIds)
      {
        var hasLink = await _context.WorkspaceApplications
            .AnyAsync(wa => wa.WorkspaceId == wsId && wa.ApplicationId == application.Id);

        if (!hasLink)
        {
          _context.WorkspaceApplications.Add(new WorkspaceApplication
          {
            CorporationId = corporationId,
            WorkspaceId = wsId,
            ApplicationId = application.Id,
            Default = false,
            TrialStartDate = null,
            TrialDays = null,
            TrialUsed = false,
            Inactive = false,
            System = false
          });
        }
      }

      var hasMods = await _context.ApplicationModules
          .AnyAsync(m => m.ApplicationId == application.Id);

      if (!hasMods)
      {
        var overviewMod = new ApplicationModule
        {
          Id = Guid.NewGuid(),
          CorporationId = corporationId,
          ApplicationId = application.Id,
          Name = "Visão Geral",
          Label = "Visão Geral",
          Icon = "chart-no-axes-combined",
          Color = application.Color ?? "violet",
          Order = 0,
          System = false,
          Description = $"Módulo inicial de {application.Name}"
        };
        _context.ApplicationModules.Add(overviewMod);

        var dashboardSub = new ApplicationSubModule
        {
          Id = Guid.NewGuid(),
          CorporationId = corporationId,
          ApplicationModuleId = overviewMod.Id,
          Name = "Dashboard",
          Label = "Dashboard",
          Icon = "chart-no-axes-combined",
          Color = application.Color ?? "violet",
          Order = 1,
          RoutePattern = "dashboard",
          Default = true,
          HtmlContent = string.Empty,
          System = false,
          Description = $"Página inicial de {application.Name}"
        };
        _context.ApplicationSubModules.Add(dashboardSub);
      }
    }
  }

  public async Task SyncApplicationWorkspacesAsync(Guid applicationId, List<Guid> workspaceIds)
  {
    var app = await _context.Applications.FirstOrDefaultAsync(a => a.Id == applicationId);
    if (app is null)
      return;

    var requestedSet = (workspaceIds ?? [])
        .Where(id => id != Guid.Empty)
        .ToHashSet();

    var existingLinks = await _context.WorkspaceApplications
        .Where(wa => wa.ApplicationId == applicationId)
        .ToListAsync();

    foreach (var link in existingLinks)
    {
      if (requestedSet.Contains(link.WorkspaceId))
      {
        if (link.Inactive)
        {
          link.Inactive = false;
        }
      }
      else if (!link.System)
      {
        _context.WorkspaceApplications.Remove(link);
      }
    }

    var existingWsIds = existingLinks.Select(l => l.WorkspaceId).ToHashSet();
    foreach (var wsId in requestedSet)
    {
      if (!existingWsIds.Contains(wsId))
      {
        _context.WorkspaceApplications.Add(new WorkspaceApplication
        {
          CorporationId = app.CorporationId,
          WorkspaceId = wsId,
          ApplicationId = applicationId,
          Default = false,
          TrialStartDate = null,
          TrialDays = null,
          TrialUsed = false,
          Inactive = false,
          System = false
        });
      }
    }
  }

  public async Task<ApplicationModule> SaveModuleAsync(Guid applicationId, ApplicationModule module)
  {
    var app = await _context.Applications.FirstOrDefaultAsync(a => a.Id == applicationId)
        ?? throw new InvalidOperationException("Aplicação não encontrada.");

    var cleanName = (module.Name ?? string.Empty).Trim();
    if (cleanName.Length > 20)
    {
      cleanName = cleanName[..20];
    }
    var cleanLabel = string.IsNullOrWhiteSpace(module.Label) ? cleanName : module.Label.Trim();
    if (cleanLabel.Length > 20)
    {
      cleanLabel = cleanLabel[..20];
    }

    if (module.Id != Guid.Empty)
    {
      var existing = await _context.ApplicationModules.FirstOrDefaultAsync(m => m.Id == module.Id);
      if (existing is not null)
      {
        existing.Name = cleanName;
        existing.Label = cleanLabel;
        existing.Icon = string.IsNullOrWhiteSpace(module.Icon) ? "layers" : module.Icon.Trim();
        existing.Color = module.Color ?? app.Color ?? "violet";
        existing.Order = module.Order;
        existing.Description = module.Description;
        await _context.SaveChangesAsync();
        return existing;
      }
    }

    var existingModules = await _context.ApplicationModules
        .Where(m => m.ApplicationId == applicationId)
        .OrderBy(m => m.Order)
        .ToListAsync();

    for (var i = 0; i < existingModules.Count; i++)
    {
      existingModules[i].Order = i + 1;
    }

    var created = new ApplicationModule
    {
      Id = Guid.NewGuid(),
      CorporationId = app.CorporationId,
      ApplicationId = applicationId,
      Name = cleanName,
      Label = cleanLabel,
      Icon = string.IsNullOrWhiteSpace(module.Icon) ? "layers" : module.Icon.Trim(),
      Color = module.Color ?? app.Color ?? "violet",
      Order = 0,
      System = false,
      Description = module.Description
    };

    _context.ApplicationModules.Add(created);
    await _context.SaveChangesAsync();
    return created;
  }

  public async Task DeleteModuleAsync(Guid moduleId)
  {
    var mod = await _context.ApplicationModules
        .Include(m => m.ApplicationSubModules)
        .FirstOrDefaultAsync(m => m.Id == moduleId);

    if (mod is null)
      return;

    if (mod.ApplicationSubModules.Count > 0)
    {
      _context.ApplicationSubModules.RemoveRange(mod.ApplicationSubModules);
    }
    _context.ApplicationModules.Remove(mod);
    await _context.SaveChangesAsync();
  }

  public async Task<ApplicationSubModule> SaveSubModulePageAsync(Guid moduleId, ApplicationSubModule page)
  {
    var mod = await _context.ApplicationModules.FirstOrDefaultAsync(m => m.Id == moduleId)
        ?? throw new InvalidOperationException("Módulo da aplicação não encontrado.");

    var cleanRoute = (page.RoutePattern ?? page.Name ?? "pagina")
        .Trim()
        .Trim('/')
        .ToLowerInvariant()
        .Replace(" ", "-");

    if (page.Default)
    {
      var allAppPages = await _context.ApplicationSubModules
          .Include(sm => sm.ApplicationModule)
          .Where(sm => sm.ApplicationModule!.ApplicationId == mod.ApplicationId && sm.Default && sm.Id != page.Id)
          .ToListAsync();
      foreach (var other in allAppPages)
      {
        other.Default = false;
      }
    }

    var cleanSubName = (page.Name ?? string.Empty).Trim();
    if (cleanSubName.Length > 20)
    {
      cleanSubName = cleanSubName[..20];
    }
    var cleanSubLabel = string.IsNullOrWhiteSpace(page.Label) ? cleanSubName : page.Label.Trim();
    if (cleanSubLabel.Length > 20)
    {
      cleanSubLabel = cleanSubLabel[..20];
    }

    if (page.Id != Guid.Empty)
    {
      var existing = await _context.ApplicationSubModules.FirstOrDefaultAsync(sm => sm.Id == page.Id);
      if (existing is not null)
      {
        existing.ApplicationModuleId = moduleId;
        existing.Name = cleanSubName;
        existing.Label = cleanSubLabel;
        existing.Icon = string.IsNullOrWhiteSpace(page.Icon) ? "file-text" : page.Icon.Trim();
        existing.Color = page.Color ?? mod.Color ?? "violet";
        existing.Order = page.Order;
        existing.RoutePattern = cleanRoute;
        existing.Default = page.Default;
        existing.HtmlContent = page.HtmlContent;
        existing.CustomHtmlContent = page.CustomHtmlContent;
        existing.CssContent = page.CssContent;
        existing.TsContent = page.TsContent;
        existing.JsContent = page.JsContent;
        existing.IsCustomHtml = page.IsCustomHtml;
        existing.Description = page.Description;
        await _context.SaveChangesAsync();
        return existing;
      }
    }

    var count = await _context.ApplicationSubModules.CountAsync(sm => sm.ApplicationModuleId == moduleId);
    var created = new ApplicationSubModule
    {
      Id = Guid.NewGuid(),
      CorporationId = mod.CorporationId,
      ApplicationModuleId = moduleId,
      Name = cleanSubName,
      Label = cleanSubLabel,
      Icon = string.IsNullOrWhiteSpace(page.Icon) ? "file-text" : page.Icon.Trim(),
      Color = page.Color ?? mod.Color ?? "violet",
      Order = page.Order > 0 ? page.Order : count + 1,
      RoutePattern = cleanRoute,
      Default = page.Default,
      HtmlContent = page.HtmlContent,
      CustomHtmlContent = page.CustomHtmlContent,
      CssContent = page.CssContent,
      TsContent = page.TsContent,
      JsContent = page.JsContent,
      IsCustomHtml = page.IsCustomHtml,
      System = false,
      Description = page.Description
    };

    _context.ApplicationSubModules.Add(created);
    await _context.SaveChangesAsync();
    return created;
  }

  public async Task DeleteSubModulePageAsync(Guid pageId)
  {
    var page = await _context.ApplicationSubModules.FirstOrDefaultAsync(sm => sm.Id == pageId);
    if (page is null)
      return;

    _context.ApplicationSubModules.Remove(page);
    await _context.SaveChangesAsync();
  }

  public async Task<List<MorphusApplication>> GetAllApplicationsIgnoreFiltersAsync()
  {
    return await _context.Applications
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(a => !a.Inactive)
        .ToListAsync();
  }

  public async Task<List<CorporationDomain>> GetCorporationDomainsAsync()
  {
    return await _context.CorporationDomains
        .AsNoTracking()
        .Include(d => d.DomainRecords)
        .Where(d => !d.Inactive)
        .OrderByDescending(d => d.IsPrimary)
        .ThenBy(d => d.DomainName)
        .ToListAsync();
  }

  public async Task<List<CorporationDomain>> GetAllCorporationDomainsIgnoreFiltersAsync()
  {
    return await _context.CorporationDomains
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(d => !d.Inactive)
        .ToListAsync();
  }

  public async Task<CorporationDomain> SaveCorporationDomainAsync(CorporationDomain domain)
  {
    var cleanDomain = (domain.DomainName ?? string.Empty)
        .Trim()
        .ToLowerInvariant()
        .Replace("https://", string.Empty)
        .Replace("http://", string.Empty)
        .TrimEnd('/');

    if (string.IsNullOrWhiteSpace(cleanDomain) || !cleanDomain.Contains('.'))
      throw new InvalidOperationException("Informe um domínio válido (ex: suaempresa.com ou suaempresa.com.br).");

    var existingGlobal = await _context.CorporationDomains
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(d => d.DomainName.ToLower() == cleanDomain && d.Id != domain.Id);

    if (existingGlobal is not null)
    {
      if (existingGlobal.CorporationId == _context.CurrentCorporationId)
        return existingGlobal;

      throw new InvalidOperationException($"O domínio '{cleanDomain}' já está registrado em outra corporação.");
    }

    var origin = string.IsNullOrWhiteSpace(domain.OriginType) ? "CustomerOwned" : domain.OriginType.Trim();
    var isPurchased = string.Equals(origin, "PurchasedWithMorphus", StringComparison.OrdinalIgnoreCase);

    var created = new CorporationDomain
    {
      Id = domain.Id != Guid.Empty ? domain.Id : Guid.NewGuid(),
      CorporationId = _context.CurrentCorporationId,
      DomainName = cleanDomain,
      OriginType = isPurchased ? "PurchasedWithMorphus" : "CustomerOwned",
      VerificationStatus = isPurchased ? "Verified" : "PendingVerification",
      VerificationToken = $"mpx-verify-{MorphusEntity.GenerateKey().ToLowerInvariant()}",
      IsPrimary = domain.IsPrimary,
      System = false,
      Inactive = false,
      Description = domain.Description
    };

    _context.CorporationDomains.Add(created);
    await _context.SaveChangesAsync();
    return created;
  }

  public async Task<List<ApplicationSetting>> GetApplicationSettingsAsync(Guid applicationId)
  {
    return await _context.ApplicationSettings
        .AsNoTracking()
        .Where(s => s.ApplicationId == applicationId && !s.Inactive)
        .OrderBy(s => s.Order)
        .ThenBy(s => s.SettingKey)
        .ToListAsync();
  }

  public async Task<ApplicationSetting> SaveApplicationSettingAsync(Guid applicationId, ApplicationSetting setting)
  {
    var app = await _context.Applications.FirstOrDefaultAsync(a => a.Id == applicationId)
        ?? throw new InvalidOperationException("Aplicação não encontrada.");

    var cleanKey = (setting.SettingKey ?? string.Empty)
        .Trim()
        .ToUpperInvariant()
        .Replace(" ", "_");

    if (string.IsNullOrWhiteSpace(cleanKey))
      throw new InvalidOperationException("Informe a chave da configuração (Setting Key).");

    var cleanLabel = string.IsNullOrWhiteSpace(setting.Label) ? cleanKey : setting.Label.Trim();

    if (setting.Id != Guid.Empty)
    {
      var existing = await _context.ApplicationSettings.FirstOrDefaultAsync(s => s.Id == setting.Id && s.ApplicationId == applicationId);
      if (existing is not null)
      {
        if (existing.IsLockedSystem)
          throw new InvalidOperationException("Configurações nativas de sistema não podem ser alteradas.");

        existing.SettingKey = cleanKey;
        existing.Label = cleanLabel;
        existing.ValueType = string.IsNullOrWhiteSpace(setting.ValueType) ? "string" : setting.ValueType.Trim();
        existing.Value = setting.Value ?? string.Empty;
        existing.EndpointUrl = string.IsNullOrWhiteSpace(setting.EndpointUrl) ? null : setting.EndpointUrl.Trim();
        existing.RefreshPolicy = string.IsNullOrWhiteSpace(setting.RefreshPolicy) ? "manual" : setting.RefreshPolicy.Trim();
        existing.Description = setting.Description;
        await _context.SaveChangesAsync();
        return existing;
      }
    }

    var duplicate = await _context.ApplicationSettings
        .FirstOrDefaultAsync(s => s.ApplicationId == applicationId && s.SettingKey.ToUpper() == cleanKey);

    if (duplicate is not null)
      throw new InvalidOperationException($"Já existe uma opção com a chave '{cleanKey}' nesta aplicação.");

    var count = await _context.ApplicationSettings.CountAsync(s => s.ApplicationId == applicationId);
    var created = new ApplicationSetting
    {
      Id = Guid.NewGuid(),
      CorporationId = app.CorporationId,
      ApplicationId = applicationId,
      SettingKey = cleanKey,
      Label = cleanLabel,
      ValueType = string.IsNullOrWhiteSpace(setting.ValueType) ? "string" : setting.ValueType.Trim(),
      Value = setting.Value ?? string.Empty,
      EndpointUrl = string.IsNullOrWhiteSpace(setting.EndpointUrl) ? null : setting.EndpointUrl.Trim(),
      RefreshPolicy = string.IsNullOrWhiteSpace(setting.RefreshPolicy) ? "manual" : setting.RefreshPolicy.Trim(),
      IsLockedSystem = false,
      Order = count + 1,
      System = false,
      Inactive = false,
      Description = setting.Description
    };

    _context.ApplicationSettings.Add(created);
    await _context.SaveChangesAsync();
    return created;
  }

  public async Task DeleteApplicationSettingAsync(Guid settingId)
  {
    var existing = await _context.ApplicationSettings.FirstOrDefaultAsync(s => s.Id == settingId);
    if (existing is null)
      return;

    if (existing.IsLockedSystem)
      throw new InvalidOperationException("Não é permitido remover uma opção nativa do sistema.");

    _context.ApplicationSettings.Remove(existing);
    await _context.SaveChangesAsync();
  }
}
