using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.ModuleSerrvice;

public class ModuleService(IMorphusTransaction mpsTransaction,
                           IModuleRepository mpsModuleReporitory,
                           IHttpContextAccessor httpContext) : MorphusService<Module>(httpContext), IModuleService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IModuleRepository moduleReporitory = mpsModuleReporitory;

  public async Task<Module?> GetById(Guid id)
  {
    var entity = await moduleReporitory.GetById(id);

    return entity;
  }

  public async Task<List<Module>> GetModulesByKey(string key)
  {
    var entities = await moduleReporitory.GetModulesByKey(key);

    return entities;
  }

  public async Task<List<Module>> GetList()
  {
    var entities = await moduleReporitory.GetList();

    return entities;
  }

  public async Task<List<SubModule>> GetSubModules(Guid id)
  {
    var entities = await moduleReporitory.GetSubModules(id);

    return entities;
  }

  public async Task<Module> Create(Module entity)
  {
    entity = await moduleReporitory.Create(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<Module> Update(Module entity)
  {
    entity = await moduleReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Delete(Guid id)
  {
    var result = await moduleReporitory.Delete(id);

    await transaction.Commit();

    return result;
  }
}
