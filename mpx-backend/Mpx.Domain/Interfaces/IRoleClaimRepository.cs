using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IRoleClaimRepository : IMorphusRepository<RoleClaim>
{
  Task<List<Claim>> GetEntitiesToRelateAsync(Guid roleId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null);
  Task<List<RoleClaim>> GetRelatedEntitiesAsync(Guid roleId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null);
  Task<RoleClaim?> GetByKeysAsync(Guid roleId, Guid claimId);
  Task<RoleClaim> AddRelationshipAsync(RoleClaim entity);
  RoleClaim RemoveRelationship(RoleClaim entity);
}

