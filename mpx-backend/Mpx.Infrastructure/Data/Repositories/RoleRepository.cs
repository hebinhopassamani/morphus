using Microsoft.EntityFrameworkCore;

using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Infrastructure.Data.Core;

namespace Mpx.Infrastructure.Data.Repositories;

public class RoleRepository(MpxDbContext context) : MpxRepository<Role>(context), IRoleRepository
{
  public async Task<List<Role>> GetListAsync()
  {
    return await _context.Roles
        .AsNoTracking()
        .Include(r => r.Module)
          .ThenInclude(m => m!.Application)
        .Include(r => r.SubModule)
        .OrderBy(r => r.Name)
        .ToListAsync();
  }
}


