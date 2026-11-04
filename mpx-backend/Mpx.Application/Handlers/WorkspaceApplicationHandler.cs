using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class WorkspaceApplicationHandler(
    IWorkspaceApplicationRepository workspaceApplicationRepository,
    IUnitOfWork unitOfWork)
{
  public Task<List<MorphusApplication>> GetEntitiesToRelateAsync(Guid workspaceId) =>
      workspaceApplicationRepository.GetEntitiesToRelateAsync(workspaceId);

  public Task<List<WorkspaceApplication>> GetRelatedEntitiesAsync(Guid workspaceId) =>
      workspaceApplicationRepository.GetRelatedEntitiesAsync(workspaceId);

  public async Task<WorkspaceApplication> AddRelationshipAsync(WorkspaceApplication workspaceApplication)
  {
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId);

    if (existing is not null)
    {
      existing.Inactive = false;
      workspaceApplicationRepository.Update(existing);
      await unitOfWork.SaveChangesAsync();
      return existing;
    }

    await workspaceApplicationRepository.AddRelationshipAsync(workspaceApplication);
    await unitOfWork.SaveChangesAsync();
    return workspaceApplication;
  }

  public async Task<List<WorkspaceApplication>> AddRelationshipsAsync(List<WorkspaceApplication> items)
  {
    var added = new List<WorkspaceApplication>();
    foreach (var item in items)
    {
      var existing = await workspaceApplicationRepository.GetByKeysAsync(item.WorkspaceId, item.ApplicationId);
      if (existing is null)
      {
        await workspaceApplicationRepository.AddRelationshipAsync(item);
        added.Add(item);
      }
    }
    if (added.Count > 0)
      await unitOfWork.SaveChangesAsync();

    return added;
  }

  public async Task<WorkspaceApplication> RemoveRelationshipAsync(WorkspaceApplication workspaceApplication)
  {
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId)
        ?? throw new KeyNotFoundException("Vínculo entre workspace e aplicação não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido remover uma aplicação nativa do sistema.");

    workspaceApplicationRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task<int> RemoveRelationshipsAsync(List<WorkspaceApplication> items)
  {
    var removedCount = 0;
    foreach (var item in items)
    {
      var existing = await workspaceApplicationRepository.GetByKeysAsync(item.WorkspaceId, item.ApplicationId);
      if (existing is not null && !existing.System)
      {
        workspaceApplicationRepository.RemoveRelationship(existing);
        removedCount++;
      }
    }
    if (removedCount > 0)
      await unitOfWork.SaveChangesAsync();

    return removedCount;
  }

  public async Task ActivateAsync(WorkspaceApplication workspaceApplication)
  {
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId)
        ?? throw new KeyNotFoundException("Vínculo entre workspace e aplicação não encontrado.");

    existing.Inactive = false;
    workspaceApplicationRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(WorkspaceApplication workspaceApplication)
  {
    var existing = await workspaceApplicationRepository.GetByKeysAsync(
        workspaceApplication.WorkspaceId,
        workspaceApplication.ApplicationId)
        ?? throw new KeyNotFoundException("Vínculo entre workspace e aplicação não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido desativar uma aplicação nativa do sistema.");

    existing.Inactive = true;
    workspaceApplicationRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
