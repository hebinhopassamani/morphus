using Microsoft.EntityFrameworkCore;

using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Infrastructure.Data.Core;

namespace Mpx.Infrastructure.Data.Repositories;

public class ClaimRepository(MpxDbContext context) : MpxRepository<Claim>(context), IClaimRepository
{
  public async Task<List<Claim>> GetListAsync()
  {
    return await _context.Claims
        .AsNoTracking()
        .Include(c => c.Module)
          .ThenInclude(m => m!.Application)
        .Include(c => c.SubModule)
        .OrderBy(c => c.ClaimType)
        .ThenBy(c => c.ClaimValue)
        .ToListAsync();
  }
}


