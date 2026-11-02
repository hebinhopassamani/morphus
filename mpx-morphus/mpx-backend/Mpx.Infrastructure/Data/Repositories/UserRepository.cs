using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class UserRepository(MorphusDbContext context) : MorphusRepository<User>(context), IUserRepository
{
  public async Task<List<User>> GetListAsync()
  {
    return await _context.Users
        .AsNoTracking()
        .Include(u => u.UserStatus)
        .OrderBy(u => u.Name)
        .ToListAsync();
  }

  public async Task<User?> GetByLoginAsync(string email)
  {
    var normalizedEmail = email.Trim().ToLowerInvariant();

    return await _context.Users
        .IgnoreQueryFilters()
        .Include(u => u.UserRoles.Where(ur => !ur.Inactive))
          .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r!.RoleClaims.Where(rc => !rc.Inactive))
              .ThenInclude(rc => rc.Claim)
        .Include(u => u.UserClaims.Where(uc => !uc.Inactive))
          .ThenInclude(uc => uc.Claim)
        .Include(u => u.CorporationUsers.Where(cu => !cu.Inactive))
          .ThenInclude(cu => cu.Corporation)
        .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == normalizedEmail && !u.Inactive);
  }

  public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
  {
    return await _context.Users
        .IgnoreQueryFilters()
        .Include(u => u.UserRoles.Where(ur => !ur.Inactive))
          .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r!.RoleClaims.Where(rc => !rc.Inactive))
              .ThenInclude(rc => rc.Claim)
        .Include(u => u.UserClaims.Where(uc => !uc.Inactive))
          .ThenInclude(uc => uc.Claim)
        .Include(u => u.CorporationUsers.Where(cu => !cu.Inactive))
          .ThenInclude(cu => cu.Corporation)
        .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && !u.Inactive);
  }

  public async Task<User?> GetByIdWithAccessAsync(Guid userId)
  {
    return await _context.Users
        .IgnoreQueryFilters()
        .Include(u => u.UserRoles.Where(ur => !ur.Inactive))
          .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r!.RoleClaims.Where(rc => !rc.Inactive))
              .ThenInclude(rc => rc.Claim)
        .Include(u => u.UserClaims.Where(uc => !uc.Inactive))
          .ThenInclude(uc => uc.Claim)
        .Include(u => u.CorporationUsers.Where(cu => !cu.Inactive))
          .ThenInclude(cu => cu.Corporation)
        .FirstOrDefaultAsync(u => u.Id == userId && !u.Inactive);
  }

  public async Task<User?> GetByEmailAsync(string? email)
  {
    if (string.IsNullOrWhiteSpace(email))
      return null;

    var normalizedEmail = email.Trim().ToLowerInvariant();

    return await _context.Users
        .IgnoreQueryFilters()
        .Include(u => u.CorporationUsers.Where(cu => !cu.Inactive))
          .ThenInclude(cu => cu.Corporation)
        .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == normalizedEmail);
  }

  public async Task<bool> ExistsEmailAsync(string email, Guid? userId = null)
  {
    var normalizedEmail = email.Trim().ToLowerInvariant();

    var query = _context.Users
        .IgnoreQueryFilters()
        .Where(u => u.Email != null && u.Email.ToLower() == normalizedEmail);

    if (userId is not null)
    {
      query = query.Where(u => u.Id != userId);
    }

    return await query.AnyAsync();
  }
}

