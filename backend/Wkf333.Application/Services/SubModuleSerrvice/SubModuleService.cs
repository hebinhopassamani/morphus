using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.SubModuleSerrvice;

public class SubModuleService(IMorphusTransaction mpsTransaction,
                              ISubModuleRepository mpsSubModuleReporitory,
                              IHttpContextAccessor httpContext) : MorphusService<SubModule>(httpContext), ISubModuleService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly ISubModuleRepository subModuleReporitory = mpsSubModuleReporitory;

  public async Task<SubModule?> GetById(Guid id)
  {
    var entity = await subModuleReporitory.GetById(id);

    return entity;
  }

  public async Task<SubModule> Create(SubModule entity)
  {
    entity = await subModuleReporitory.Create(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<SubModule> Update(SubModule entity)
  {
    entity = await subModuleReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Delete(Guid id)
  {
    var result = await subModuleReporitory.Delete(id);

    await transaction.Commit();

    return result;
  }
}
