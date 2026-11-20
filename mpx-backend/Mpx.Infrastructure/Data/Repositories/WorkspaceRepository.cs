using Microsoft.EntityFrameworkCore;

using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;
using Mpx.Infrastructure.Data.Core;

namespace Mpx.Infrastructure.Data.Repositories;

public class WorkspaceRepository(MpxDbContext context) : MpxRepository<Workspace>(context), IWorkspaceRepository
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

