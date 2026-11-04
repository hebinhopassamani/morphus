using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class SubModuleRepository(MorphusDbContext context) : MorphusRepository<SubModule>(context), ISubModuleRepository
{
  public async Task<List<SubModule>> GetListAsync()
  {
    return await _context.SubModules
        .AsNoTracking()
        .Include(s => s.Module)
        .OrderBy(s => s.Name)
        .ToListAsync();
  }

  public async Task<List<SubModule>> GetByModuleIdAsync(Guid moduleId)
  {
    return await _context.SubModules
        .AsNoTracking()
        .Include(s => s.Module)
        .Where(s => s.ModuleId == moduleId)
        .OrderBy(s => s.Name)
        .ToListAsync();
  }

  public async Task<bool> HasDependenciesAsync(Guid subModuleId)
  {
    var hasRoles = await _context.Roles.AsNoTracking().AnyAsync(r => r.SubModuleId == subModuleId);
    if (hasRoles)
      return true;

    return await _context.Claims.AsNoTracking().AnyAsync(c => c.SubModuleId == subModuleId);
  }
}

