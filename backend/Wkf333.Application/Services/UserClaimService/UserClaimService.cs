using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.UserClaimService;

public class UserClaimService(IMorphusTransaction mpsTransaction,
                              IUserClaimRepository mpsUserClaimReporitory,
                              IHttpContextAccessor httpContext) : MorphusService<UserClaim>(httpContext), IUserClaimService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IUserClaimRepository userClaimReporitory = mpsUserClaimReporitory;

  public async Task<List<Claim>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var entities = await userClaimReporitory.GetEntitiesToRelate(userId, moduleId, subModuleId);

    return entities;
  }

  public async Task<List<UserClaim>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var entities = await userClaimReporitory.GetRelatedEntities(userId, moduleId, subModuleId);

    return entities;
  }

  public async Task<UserClaim> AddRelationship(UserClaim entity)
  {
    entity = await userClaimReporitory.AddRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<UserClaim> RemoveRelationship(UserClaim entity)
  {
    entity = userClaimReporitory.RemoveRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Activate(UserClaim entity)
  {
    entity.Inactive = false;

    await userClaimReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }

  public async Task<bool> DeActivate(UserClaim entity)
  {
    entity.Inactive = true;

    await userClaimReporitory.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }
}
