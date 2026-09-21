using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class RoleRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<Role>(mpsContext, httpContext), IRoleRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<Role>> GetList()
  {
    var query = context.Role
                       .AsNoTracking()
                         .Include(m => m.Module)
                       .Where(r => r.BusinessId == BusinessId);

    return await query.ToListAsync();
  }
}
