using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IWorkspaceUserRepository : IMorphusRepository<WorkspaceUser>
{
  Task<List<User>> GetEntitiesToRelateAsync(Guid workspaceId);
  Task<List<WorkspaceUser>> GetRelatedEntitiesAsync(Guid workspaceId);
  Task<WorkspaceUser?> GetByKeysAsync(Guid workspaceId, Guid userId);
  Task<WorkspaceUser> AddRelationshipAsync(WorkspaceUser entity);
  WorkspaceUser RemoveRelationship(WorkspaceUser entity);
}
