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
}

