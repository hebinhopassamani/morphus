using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IWorkspaceApplicationRepository : IMpxRepository<WorkspaceApplication>
{
  Task<List<Application>> GetEntitiesToRelateAsync(Guid workspaceId);
  Task<List<WorkspaceApplication>> GetRelatedEntitiesAsync(Guid workspaceId);
  Task<WorkspaceApplication?> GetByKeysAsync(Guid workspaceId, Guid applicationId);
  Task<WorkspaceApplication?> GetTrialHistoryByApplicationAsync(Guid applicationId);
  Task<WorkspaceApplication> AddRelationshipAsync(WorkspaceApplication entity);
  WorkspaceApplication RemoveRelationship(WorkspaceApplication entity);
}

