using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IApplicationUserRepository : IMpxRepository<ApplicationUser>
{
  Task<List<User>> GetEntitiesToRelateAsync(Guid applicationId);
  Task<List<ApplicationUser>> GetRelatedEntitiesAsync(Guid applicationId);
  Task<ApplicationUser?> GetByKeysAsync(Guid applicationId, Guid userId);
  Task<ApplicationUser> AddRelationshipAsync(ApplicationUser entity);
  ApplicationUser RemoveRelationship(ApplicationUser entity);
}

