using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class CorporationRepository(MorphusDbContext context) : MorphusRepository<Corporation>(context), ICorporationRepository
{
  public async Task<List<Corporation>> GetListAsync(Guid activeCorporationId)
  {
    var parent = await GetParentCorporationAsync(activeCorporationId);
    if (parent is null)
      return [];

    var ids = new List<Guid> { parent.Id };
    ids.AddRange(parent.Corporations.Select(c => c.Id));

    return await _context.Corporations
        .AsNoTracking()
        .Where(c => ids.Contains(c.Id))
        .OrderBy(c => c.Name)
        .ToListAsync();
  }

  public async Task<Corporation?> GetParentCorporationAsync(Guid activeCorporationId)
  {
    var loggedCorp = await _context.Corporations
        .Include(c => c.Corporations)
        .FirstOrDefaultAsync(c => c.Id == activeCorporationId);

    if (loggedCorp is null)
      return null;

    if (loggedCorp.CorporationId is null)
      return loggedCorp;

    return await _context.Corporations
        .Include(c => c.Corporations)
        .FirstOrDefaultAsync(c => c.Id == loggedCorp.CorporationId);
  }

  public async Task<Corporation?> GetOnboardingGraphAsync(Guid corporationId)
  {
    return await _context.Corporations
        .IgnoreQueryFilters()
        .Include(c => c.Workspaces)
        .Include(c => c.WorkspaceUsers)
        .Include(c => c.Applications)
        .Include(c => c.WorkspaceApplications)
        .Include(c => c.ApplicationUsers)
        .FirstOrDefaultAsync(c => c.Id == corporationId);
  }
}
