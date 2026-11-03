using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class ApplicationRepository(MorphusDbContext context) : MorphusRepository<MorphusApplication>(context), IApplicationRepository
{
  public async Task<List<MorphusApplication>> GetListAsync()
  {
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
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
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Category)
        .Include(a => a.ApplicationStatus)
        .Include(a => a.ApplicationModules.Where(m => !m.Inactive).OrderBy(m => m.Order))
          .ThenInclude(m => m.ApplicationSubModules.Where(sm => !sm.Inactive).OrderBy(sm => sm.Order))
        .FirstOrDefaultAsync(a => a.Key == key);
  }
}
