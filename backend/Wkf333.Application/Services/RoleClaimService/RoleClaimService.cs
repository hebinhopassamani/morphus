using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.RoleClaimService;

public class RoleClaimService(IMorphusTransaction mpsTransaction,
                              IRoleClaimRepository mpsRoleReporitory,
                              IHttpContextAccessor httpContext) : MorphusService<RoleClaim>(httpContext), IRoleClaimService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IRoleClaimRepository roleReporitory = mpsRoleReporitory;

  public async Task<List<Claim>> GetEntitiesToRelate(Guid roleId, Guid? moduleId, Guid? subModuleId)
  {
    var entities = await roleReporitory.GetEntitiesToRelate(roleId, moduleId, subModuleId);

    return entities;
  }

  public async Task<List<RoleClaim>> GetRelatedEntities(Guid roleId, Guid? moduleId, Guid? subModuleId)
  {
    var entities = await roleReporitory.GetRelatedEntities(roleId, moduleId, subModuleId);

    return entities;
  }

  public async Task<RoleClaim> AddRelationship(RoleClaim entity)
  {
    entity = await roleReporitory.AddRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<RoleClaim> RemoveRelationship(RoleClaim entity)
  {
    entity = roleReporitory.RemoveRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Activate(RoleClaim entity)
  {
    entity.Inactive = false;

    await roleReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }

  public async Task<bool> DeActivate(RoleClaim entity)
  {
    entity.Inactive = true;

    await roleReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }
}
