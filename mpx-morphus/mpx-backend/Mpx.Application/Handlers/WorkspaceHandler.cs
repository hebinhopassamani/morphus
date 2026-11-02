using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class WorkspaceHandler(
    IWorkspaceRepository workspaceRepository,
    IWorkspaceUserRepository workspaceUserRepository,
    IUnitOfWork unitOfWork)
{
  public Task<Workspace?> GetByIdAsync(Guid id) => workspaceRepository.GetByIdAsync(id);

  public Task<List<Workspace>> GetListAsync() => workspaceRepository.GetListAsync();

  public Task<Workspace?> GetByKeyAsync(string key) => workspaceRepository.GetByKeyAsync(key);

  public async Task<Workspace> CreateAsync(Workspace workspace, Guid creatorUserId)
  {
    if (workspace.Id == Guid.Empty)
      workspace.Id = Guid.NewGuid();

    await workspaceRepository.AddAsync(workspace);

    if (creatorUserId != Guid.Empty)
    {
      await workspaceUserRepository.AddRelationshipAsync(new WorkspaceUser
      {
        WorkspaceId = workspace.Id,
        UserId = creatorUserId,
        IsOwner = true,
        System = false
      });
    }

    await unitOfWork.SaveChangesAsync();
    return workspace;
  }

  public async Task<Workspace> UpdateAsync(Workspace workspace)
  {
    workspaceRepository.Update(workspace);
    await unitOfWork.SaveChangesAsync();
    return workspace;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await workspaceRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir o workspace padrão do sistema.");

    workspaceRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
