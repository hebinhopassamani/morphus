using Microsoft.EntityFrameworkCore;

using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Infrastructure.Data.Core;

namespace Mpx.Infrastructure.Data.Repositories;

public class UserStatusRepository(MpxDbContext context) : MpxRepository<UserStatus>(context), IUserStatusRepository
{
  public async Task<List<UserStatus>> GetListAsync()
  {
    return await _context.UserStatus
        .AsNoTracking()
        .OrderBy(us => us.Name)
        .ToListAsync();
  }
}


