using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.UserClaimService;

public interface IUserClaimService : IMorphusService<UserClaim>
{
  Task<List<Claim>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId);
  Task<List<UserClaim>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId);

  Task<UserClaim> AddRelationship(UserClaim entity);
  Task<UserClaim> RemoveRelationship(UserClaim entity);

  Task<bool> Activate(UserClaim entity);
  Task<bool> DeActivate(UserClaim entity);
}
