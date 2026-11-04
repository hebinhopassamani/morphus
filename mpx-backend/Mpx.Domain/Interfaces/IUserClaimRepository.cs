using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IUserClaimRepository : IMorphusRepository<UserClaim>
{
  Task<List<Claim>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null);
  Task<List<UserClaim>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null);
  Task<UserClaim?> GetByKeysAsync(Guid userId, Guid claimId);
  Task<UserClaim> AddRelationshipAsync(UserClaim entity);
  UserClaim RemoveRelationship(UserClaim entity);
}

