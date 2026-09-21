using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.UserRoleService;

public class UserRoleService(IMorphusTransaction mpsTransaction,
                             IUserRoleRepository mpsUserRoleReporitory,
                             IHttpContextAccessor httpContext) : MorphusService<UserRole>(httpContext), IUserRoleService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IUserRoleRepository userRoleReporitory = mpsUserRoleReporitory;

  public async Task<List<Role>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var entities = await userRoleReporitory.GetEntitiesToRelate(userId, moduleId, subModuleId);

    return entities;
  }

  public async Task<List<UserRole>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var entities = await userRoleReporitory.GetRelatedEntities(userId, moduleId, subModuleId);

    return entities;
  }

  public async Task<UserRole> AddRelationship(UserRole entity)
  {
    entity = await userRoleReporitory.AddRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<UserRole> RemoveRelationship(UserRole entity)
  {
    entity = userRoleReporitory.RemoveRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Activate(UserRole entity)
  {
    entity.Inactive = false;

    await userRoleReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }

  public async Task<bool> DeActivate(UserRole entity)
  {
    entity.Inactive = true;

    await userRoleReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }
}
