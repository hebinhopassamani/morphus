using Morphus.Domain.Entities.Models;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IRoleClaimRepository : IMorphusRepository<RoleClaim>
{
  Task<List<Claim>> GetEntitiesToRelate(Guid roleId, Guid? moduleId, Guid? subModuleId);
  Task<List<RoleClaim>> GetRelatedEntities(Guid roleId, Guid? moduleId, Guid? subModuleId);

  Task<RoleClaim> AddRelationship(RoleClaim entity);
  RoleClaim RemoveRelationship(RoleClaim entity);
}
