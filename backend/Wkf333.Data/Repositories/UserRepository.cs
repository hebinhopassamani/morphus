using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.Filters;
using Npgsql;


namespace Morphus.Repository;

public class UserRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<User>(mpsContext, httpContext), IUserRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<User>> GetList(MorphusFilter? filter)
  {
    var parameters = new List<NpgsqlParameter>();
    var sql = "";

    if (filter is not null)
    {
      parameters = BuildParameters(filter);

      if (!String.IsNullOrEmpty(filter.WhereClause))
      {
        sql = "WHERE " + filter.WhereClause;
      }
    }

    var query = context.User
                       .FromSqlRaw("SELECT * FROM \"User\" " + sql, [.. parameters])
                        .Include(a => a.BusinessUsers)
                          .ThenInclude(b => b.Business)
                        .Include(u => u.UserStatus)
                       .Where(x => x.BusinessUsers.Any(bu => bu!.BusinessId == BusinessId && bu.Inactive == false));

    return await query.ToListAsync();
  }

  public async Task<User?> GetByLogin(string email)
  {
    var query = context.User
                       .AsNoTracking()
                        .Include(u => u.UserRoles.Where(ur => ur.Inactive == false))
                          .ThenInclude(ur => ur.Role)
                            .ThenInclude(r => r!.RoleClaims.Where(rc => rc.Inactive == false))
                              .ThenInclude(rc => rc.Claim)
                        .Include(u => u.UserClaims.Where(uc => uc.Inactive == false))
                          .ThenInclude(uc => uc.Claim)
                      .Include(u => u.BusinessUsers.Where(bu => bu.Inactive == false))
                          .ThenInclude(b => b.Business)
                      .Where(w => w.Email == email);

    return await query.FirstOrDefaultAsync();
  }

  public async Task<User?> GetByRefreshToken(string refreshToken)
  {
    var query = context.User
                       .AsNoTracking()
                        .Include(u => u.UserRoles.Where(ur => ur.Inactive == false))
                          .ThenInclude(ur => ur.Role)
                            .ThenInclude(r => r!.RoleClaims.Where(rc => rc.Inactive == false))
                              .ThenInclude(rc => rc.Claim)
                        .Include(u => u.UserClaims.Where(uc => uc.Inactive == false))
                          .ThenInclude(uc => uc.Claim)
                        .Include(u => u.BusinessUsers.Where(bu => bu.Inactive == false))
                          .ThenInclude(b => b.Business)
                      .Where(w => w.RefreshToken == refreshToken);

    return await query.FirstOrDefaultAsync();
  }

  public async Task<User?> GetByEmail(string? email)
  {
    var query = context.User
                       .AsNoTracking()
                        .Include(rc => rc!.BusinessUsers.Where(e => e!.Inactive == false))
                          .ThenInclude(uc => uc!.Business)
                       .Where(w => w.Email == email);

    return await query.FirstOrDefaultAsync();
  }

  public async Task<bool> ExistsEmail(string email, Guid? userId = null)
  {
    var query = context.User
                       .Where(u => u.Email == email);

    if (userId is not null)
    {
      query = query.Where(u => u.Id != userId);
    }

    return await query.AnyAsync();
  }
}
