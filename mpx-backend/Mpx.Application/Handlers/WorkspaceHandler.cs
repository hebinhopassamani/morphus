using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class WorkspaceHandler(
    IWorkspaceRepository workspaceRepository,
    IWorkspaceUserRepository workspaceUserRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<Workspace>(httpContext)
{
  public Task<Workspace?> GetByIdAsync(Guid id) => workspaceRepository.GetByIdAsync(id);

  public Task<List<Workspace>> GetListAsync() => workspaceRepository.GetListAsync();

  public Task<Workspace?> GetByKeyAsync(string key) => workspaceRepository.GetByKeyAsync(key);

  public async Task<Workspace> CreateAsync(Workspace workspace, Guid? creatorUserId = null)
  {
    if (workspace.Id == Guid.Empty)
      workspace.Id = Guid.NewGuid();

    if (workspace.Default)
    {
      await workspaceRepository.ClearDefaultsExceptAsync(workspace.Id);
    }

    await workspaceRepository.AddAsync(workspace);

    var ownerId = creatorUserId is not null && creatorUserId != Guid.Empty
        ? creatorUserId.Value
        : (UserId ?? Guid.Empty);

    if (ownerId != Guid.Empty)
    {
      await workspaceUserRepository.AddRelationshipAsync(new WorkspaceUser
      {
        WorkspaceId = workspace.Id,
        UserId = ownerId,
        IsOwner = true,
        System = false
      });
    }

    await unitOfWork.SaveChangesAsync();
    await workspaceRepository.EnsureDefaultWorkspaceExistsAsync(workspace.Id);
    return workspace;
  }

  public async Task<Workspace> UpdateAsync(Workspace workspace)
  {
    if (workspace.Default)
    {
      await workspaceRepository.ClearDefaultsExceptAsync(workspace.Id);
    }

    await workspaceRepository.UpdateNotNull(workspace, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    await workspaceRepository.EnsureDefaultWorkspaceExistsAsync(workspace.Id);
    return workspace;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await workspaceRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    workspaceRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
    await workspaceRepository.EnsureDefaultWorkspaceExistsAsync();
  }
}
