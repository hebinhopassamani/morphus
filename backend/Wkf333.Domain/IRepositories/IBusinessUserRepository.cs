using Morphus.Domain.IMorphusRepository;
using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.IRepositories;

public interface IBusinessUserRepository : IMorphusRepository<BusinessUser>
{
  Task<List<BusinessUser>> GetRelatedEntities(Guid businessId);
  Task<List<User>> GetEntitiesToRelate(Guid businessId);
  Task<BusinessUser> AddRelationship(BusinessUser entity);
  BusinessUser RemoveRelationship(BusinessUser entity);
}
