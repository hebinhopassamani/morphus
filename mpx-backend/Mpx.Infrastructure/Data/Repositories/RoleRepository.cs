using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class RoleRepository(MorphusDbContext context) : MorphusRepository<Role>(context), IRoleRepository
{
  public async Task<List<Role>> GetListAsync()
  {
    return await _context.Roles
        .AsNoTracking()
        .Include(r => r.Module)
        .Include(r => r.SubModule)
        .OrderBy(r => r.Name)
        .ToListAsync();
  }
}

