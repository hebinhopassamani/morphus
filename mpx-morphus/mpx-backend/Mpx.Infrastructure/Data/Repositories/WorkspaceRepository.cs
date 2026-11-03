using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class WorkspaceRepository(MorphusDbContext context) : MorphusRepository<Workspace>(context), IWorkspaceRepository
{
  public async Task<List<Workspace>> GetListAsync()
  {
    return await _context.Workspaces
        .AsNoTracking()
        .Include(w => w.WorkspaceApplications.Where(wa => !wa.Inactive))
          .ThenInclude(wa => wa.Application)
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
