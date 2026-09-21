using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class UserStatusRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<UserStatus>(mpsContext, httpContext), IUserStatusRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<UserStatus>> GetList()
  {
    var query = context.UserStatus
                       .AsNoTracking()
                       .Where(r => r.BusinessId == BusinessId);

    return await query.ToListAsync();
  }
}
