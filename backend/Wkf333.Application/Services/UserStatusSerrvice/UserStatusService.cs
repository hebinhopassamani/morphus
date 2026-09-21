using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.UserStatusSerrvice;

public class UserStatusService(IMorphusTransaction mpsTransaction,
                               IUserStatusRepository mpsUserStatusReporitory,
                               IHttpContextAccessor httpContext) : MorphusService<UserStatus>(httpContext), IUserStatusService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IUserStatusRepository userStatusReporitory = mpsUserStatusReporitory;

  public async Task<UserStatus?> GetById(Guid id)
  {
    var entity = await userStatusReporitory.GetById(id);

    return entity;
  }

  public async Task<List<UserStatus>> GetList()
  {
    var entities = await userStatusReporitory.GetList();

    return entities;
  }

  public async Task<UserStatus> Create(UserStatus entity)
  {
    entity = await userStatusReporitory.Create(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<UserStatus> Update(UserStatus entity)
  {
    entity = await userStatusReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Delete(Guid id)
  {
    var result = await userStatusReporitory.Delete(id);

    await transaction.Commit();

    return result;
  }
}
