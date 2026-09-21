using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class ModuleRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<Module>(mpsContext, httpContext), IModuleRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<Module>> GetList()
  {
    var query = context.Module
                       .AsNoTracking()
                        .Include(m => m.SubModules)
                       .Where(r => r.BusinessId == BusinessId);

    return await query.ToListAsync();
  }

  public async Task<List<Module>> GetModulesByKey(string key)
  {
    var query = context.Module
                       .AsNoTracking()
                       .Where(e => e.Key == key && e.BusinessId == BusinessId);

    return await query.ToListAsync();
  }

  public async Task<List<SubModule>> GetSubModules(Guid id)
  {
    var query = context.SubModule
                       .AsNoTracking()
                        .Include(e => e.Module)
                       .Where(e => e.ModuleId == id);

    var entities = await query.ToListAsync();

    return entities;
  }
}
