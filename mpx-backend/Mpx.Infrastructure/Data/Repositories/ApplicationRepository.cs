using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class ApplicationRepository(MorphusDbContext context) : MorphusRepository<MorphusApplication>(context), IApplicationRepository
{
  public override async Task<MorphusApplication?> GetByIdAsync(Guid id)
  {
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
        .Include(a => a.WorkspaceApplications)
        .Include(a => a.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
          .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .FirstOrDefaultAsync(a => a.Id == id);
  }

  public async Task<List<MorphusApplication>> GetListAsync()
  {
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
        .Include(a => a.WorkspaceApplications)
        .Include(a => a.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
          .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .OrderBy(a => a.Name)
        .ToListAsync();
  }

  public async Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId)
  {
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
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
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
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

      var hasLink = await _context.WorkspaceApplications
          .AnyAsync(wa => wa.WorkspaceId == defaultWs.Id && wa.ApplicationId == application.Id);

      if (!hasLink)
      {
        _context.WorkspaceApplications.Add(new WorkspaceApplication
        {
          CorporationId = corporationId,
          WorkspaceId = defaultWs.Id,
          ApplicationId = application.Id,
          Default = false,
          TrialStartDate = DateTime.UtcNow,
          TrialDays = 14,
          TrialUsed = true,
          Inactive = false,
          System = false
        });
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
          HtmlContent =
              $"<div class=\"rounded-3xl border border-primary-a5 bg-primary-a2 p-8 shadow-sm\">" +
              $"<div class=\"inline-flex items-center gap-2 rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11\">Carregado do Banco de Dados PostgreSQL</div>" +
              $"<h1 class=\"mt-4 text-2xl font-bold text-neutral-12\">Bem-vindo ao Dashboard de {application.Name}!</h1>" +
              $"<p class=\"mt-2 text-base text-neutral-a11\">Edite este HTML na aba <strong>Módulos e Páginas</strong> da aplicação para construir suas telas.</p>" +
              $"</div>",
          System = false,
          Description = $"Página inicial de {application.Name}"
        };
        _context.ApplicationSubModules.Add(dashboardSub);
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
}
