using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IUserRoleRepository : IMorphusRepository<UserRole>
{
  Task<List<Role>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId);
  Task<List<UserRole>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId);
  Task<UserRole?> GetByKeysAsync(Guid userId, Guid roleId);
  Task<UserRole> AddRelationshipAsync(UserRole entity);
  UserRole RemoveRelationship(UserRole entity);
}

