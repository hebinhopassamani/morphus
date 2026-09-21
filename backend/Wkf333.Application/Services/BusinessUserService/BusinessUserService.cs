using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;


namespace Morphus.Application.Services.BusinessUserService;

public class BusinessUserService(IMorphusTransaction mpsTransaction,
                                 IBusinessUserRepository mpsBusinessUserReporitory,
                                 IHttpContextAccessor httpContext) : MorphusService<BusinessUser>(httpContext), IBusinessUserService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IBusinessUserRepository businessUserRepository = mpsBusinessUserReporitory;

  public async Task<List<User>> GetEntitiesToRelate(Guid businessId)
  {
    var entity = await businessUserRepository.GetEntitiesToRelate(businessId);

    return entity;
  }

  public async Task<List<BusinessUser>> GetRelatedEntities(Guid businessId)
  {
    var entities = await businessUserRepository.GetRelatedEntities(businessId);

    return entities;
  }

  public async Task<BusinessUser> AddRelationship(BusinessUser entity)
  {
    entity = await businessUserRepository.AddRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<BusinessUser> RemoveRelationship(BusinessUser entity)
  {
    entity = businessUserRepository.RemoveRelationship(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Activate(BusinessUser entity)
  {
    entity.Inactive = false;

    await businessUserRepository.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }

  public async Task<bool> DeActivate(BusinessUser entity)
  {
    entity.Inactive = true;

    await businessUserRepository.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }

  public async Task<bool> SetOwner(BusinessUser entity)
  {
    entity.IsOwner = true;

    await businessUserRepository.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }

  public async Task<bool> RemoveOwner(BusinessUser entity)
  {
    entity.IsOwner = false;

    await businessUserRepository.UpdateNotNull(entity);

    await transaction.Commit();

    return true;
  }
}
