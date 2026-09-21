using Morphus.Domain.Entities.Models;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IUserClaimRepository : IMorphusRepository<UserClaim>
{
  Task<List<Claim>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId);
  Task<List<UserClaim>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId);

  Task<UserClaim> AddRelationship(UserClaim entity);
  UserClaim RemoveRelationship(UserClaim entity);
}
