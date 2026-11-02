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
        .OrderBy(w => w.Name)
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
}
