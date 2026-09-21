using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.UserRoleService;

public interface IUserRoleService : IMorphusService<UserRole>
{
  Task<List<Role>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId);
  Task<List<UserRole>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId);

  Task<UserRole> AddRelationship(UserRole entity);
  Task<UserRole> RemoveRelationship(UserRole entity);

  Task<bool> Activate(UserRole entity);
  Task<bool> DeActivate(UserRole entity);
}
