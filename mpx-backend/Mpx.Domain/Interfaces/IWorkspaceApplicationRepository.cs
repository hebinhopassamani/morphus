using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IWorkspaceApplicationRepository : IMorphusRepository<WorkspaceApplication>
{
  Task<List<MorphusApplication>> GetEntitiesToRelateAsync(Guid workspaceId);
  Task<List<WorkspaceApplication>> GetRelatedEntitiesAsync(Guid workspaceId);
  Task<WorkspaceApplication?> GetByKeysAsync(Guid workspaceId, Guid applicationId);
  Task<WorkspaceApplication> AddRelationshipAsync(WorkspaceApplication entity);
  WorkspaceApplication RemoveRelationship(WorkspaceApplication entity);
}
