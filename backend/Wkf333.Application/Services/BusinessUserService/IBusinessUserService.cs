using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.BusinessUserService;

public interface IBusinessUserService : IMorphusService<BusinessUser>
{
  Task<List<User>> GetEntitiesToRelate(Guid businessId);
  Task<List<BusinessUser>> GetRelatedEntities(Guid businessId);

  Task<BusinessUser> AddRelationship(BusinessUser entity);
  Task<BusinessUser> RemoveRelationship(BusinessUser entity);

  Task<bool> Activate(BusinessUser entity);
  Task<bool> DeActivate(BusinessUser entity);
  Task<bool> SetOwner(BusinessUser entity);
  Task<bool> RemoveOwner(BusinessUser entity);
}
