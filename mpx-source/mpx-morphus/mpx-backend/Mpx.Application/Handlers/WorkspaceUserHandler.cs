using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class WorkspaceUserHandler(IWorkspaceUserRepository workspaceUserRepository, IUnitOfWork unitOfWork)
{
  public Task<List<User>> GetEntitiesToRelateAsync(Guid workspaceId) =>
      workspaceUserRepository.GetEntitiesToRelateAsync(workspaceId);

  public Task<List<WorkspaceUser>> GetRelatedEntitiesAsync(Guid workspaceId) =>
      workspaceUserRepository.GetRelatedEntitiesAsync(workspaceId);

  public async Task<WorkspaceUser> AddRelationshipAsync(WorkspaceUser workspaceUser)
  {
    await workspaceUserRepository.AddRelationshipAsync(workspaceUser);
    await unitOfWork.SaveChangesAsync();
    return workspaceUser;
  }

  public async Task<WorkspaceUser> RemoveRelationshipAsync(WorkspaceUser workspaceUser)
  {
    var existing = await workspaceUserRepository.GetByKeysAsync(workspaceUser.WorkspaceId, workspaceUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System || existing.IsOwner)
      throw new InvalidOperationException("Não é permitido remover o proprietário ou vínculo nativo do workspace.");

    workspaceUserRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task ActivateAsync(WorkspaceUser workspaceUser)
  {
    var existing = await workspaceUserRepository.GetByKeysAsync(workspaceUser.WorkspaceId, workspaceUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    existing.Inactive = false;
    workspaceUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(WorkspaceUser workspaceUser)
  {
    var existing = await workspaceUserRepository.GetByKeysAsync(workspaceUser.WorkspaceId, workspaceUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System || existing.IsOwner)
      throw new InvalidOperationException("Não é permitido desativar o proprietário do workspace.");

    existing.Inactive = true;
    workspaceUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task SetOwnerAsync(WorkspaceUser workspaceUser, bool isOwner)
  {
    var existing = await workspaceUserRepository.GetByKeysAsync(workspaceUser.WorkspaceId, workspaceUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System && !isOwner)
      throw new InvalidOperationException("Não é permitido remover a propriedade do usuário fundador do sistema.");

    existing.IsOwner = isOwner;
    workspaceUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
