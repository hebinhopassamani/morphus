using Morphus.Domain.Entities.Models;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IUserRoleRepository : IMorphusRepository<UserRole>
{
  Task<List<Role>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId);
  Task<List<UserRole>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId);

  Task<UserRole> AddRelationship(UserRole entity);
  UserRole RemoveRelationship(UserRole entity);
}
