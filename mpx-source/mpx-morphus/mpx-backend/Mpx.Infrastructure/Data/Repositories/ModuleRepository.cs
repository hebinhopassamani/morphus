using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class ModuleRepository(MorphusDbContext context) : MorphusRepository<Module>(context), IModuleRepository
{
  public async Task<List<SubModule>> GetSubModulesAsync(Guid id)
  {
    return await _context.SubModules
        .AsNoTracking()
        .Where(s => s.ModuleId == id)
        .OrderBy(s => s.Name)
        .ToListAsync();
  }

  public async Task<List<Module>> GetModulesByKeyAsync(string key)
  {
    return await _context.Modules
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.SubModules)
        .Where(m => m.Key == key)
        .ToListAsync();
  }

  public async Task<List<Module>> GetByApplicationIdAsync(Guid applicationId)
  {
    return await _context.Modules
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.SubModules)
        .Where(m => m.ApplicationId == applicationId)
        .OrderBy(m => m.Name)
        .ToListAsync();
  }

  public async Task<List<Module>> GetListAsync()
  {
    return await _context.Modules
        .AsNoTracking()
        .Include(m => m.Application)
        .Include(m => m.SubModules)
        .OrderBy(m => m.Name)
        .ToListAsync();
  }
}
