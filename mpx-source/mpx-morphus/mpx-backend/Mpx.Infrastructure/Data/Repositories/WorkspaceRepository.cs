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
        .Include(w => w.Applications)
        .OrderBy(w => w.Name)
        .ToListAsync();
  }

  public async Task<Workspace?> GetByKeyAsync(string key)
  {
    return await _context.Workspaces
        .AsNoTracking()
        .Include(w => w.Applications)
        .FirstOrDefaultAsync(w => w.Key == key);
  }
}
