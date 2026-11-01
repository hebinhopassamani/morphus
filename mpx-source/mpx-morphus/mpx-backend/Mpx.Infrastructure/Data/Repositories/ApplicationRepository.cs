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
        .OrderBy(a => a.Name)
        .ToListAsync();
  }

  public async Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId)
  {
    return await _context.Applications
        .AsNoTracking()
        .Where(a => !a.Inactive && a.WorkspaceApplications.Any(wa => wa.WorkspaceId == workspaceId && !wa.Inactive))
        .OrderBy(a => a.Name)
        .ToListAsync();
  }

  public async Task<MorphusApplication?> GetByKeyAsync(string key)
  {
    return await _context.Applications
        .AsNoTracking()
        .FirstOrDefaultAsync(a => a.Key == key);
  }
}
