using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class ClaimRepository(MorphusDbContext context) : MorphusRepository<Claim>(context), IClaimRepository
{
  public async Task<List<Claim>> GetListAsync()
  {
    return await _context.Claims
        .AsNoTracking()
        .Include(c => c.Module)
        .Include(c => c.SubModule)
        .OrderBy(c => c.ClaimType)
        .ThenBy(c => c.ClaimValue)
        .ToListAsync();
  }
}

