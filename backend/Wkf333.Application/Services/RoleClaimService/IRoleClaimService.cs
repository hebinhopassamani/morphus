using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.RoleClaimService;

public interface IRoleClaimService : IMorphusService<RoleClaim>
{
  Task<List<Claim>> GetEntitiesToRelate(Guid roleId, Guid? moduleId, Guid? subModuleId);
  Task<List<RoleClaim>> GetRelatedEntities(Guid roleId, Guid? moduleId, Guid? subModuleId);

  Task<RoleClaim> AddRelationship(RoleClaim entity);
  Task<RoleClaim> RemoveRelationship(RoleClaim entity);

  Task<bool> Activate(RoleClaim entity);
  Task<bool> DeActivate(RoleClaim entity);
}
