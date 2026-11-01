using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class UserStatusRepository(MorphusDbContext context) : MorphusRepository<UserStatus>(context), IUserStatusRepository
{
  public async Task<List<UserStatus>> GetListAsync()
  {
    return await _context.UserStatus
        .AsNoTracking()
        .OrderBy(us => us.Name)
        .ToListAsync();
  }
}

