using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class UserRoleHandler(IUserRoleRepository userRoleRepository, IUnitOfWork unitOfWork)
{
  public Task<List<Role>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null) =>
      userRoleRepository.GetEntitiesToRelateAsync(userId, moduleId, subModuleId, applicationId);

  public Task<List<UserRole>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null) =>
      userRoleRepository.GetRelatedEntitiesAsync(userId, moduleId, subModuleId, applicationId);

  public async Task<UserRole> AddRelationshipAsync(UserRole userRole)
  {
    var existing = await userRoleRepository.GetByKeysAsync(userRole.UserId, userRole.RoleId);
    if (existing is not null)
      return existing;

    await userRoleRepository.AddRelationshipAsync(userRole);
    await unitOfWork.SaveChangesAsync();
    return userRole;
  }

  public async Task<List<UserRole>> AddRelationshipsAsync(List<UserRole> userRoles)
  {
    var added = new List<UserRole>();
    foreach (var item in userRoles)
    {
      var existing = await userRoleRepository.GetByKeysAsync(item.UserId, item.RoleId);
      if (existing is null)
      {
        await userRoleRepository.AddRelationshipAsync(item);
        added.Add(item);
      }
    }
    if (added.Count > 0)
      await unitOfWork.SaveChangesAsync();

    return added;
  }

  public async Task<UserRole> RemoveRelationshipAsync(UserRole userRole)
  {
    var existing = await userRoleRepository.GetByKeysAsync(userRole.UserId, userRole.RoleId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido remover um perfil nativo do sistema.");

    userRoleRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task<int> RemoveRelationshipsAsync(List<UserRole> userRoles)
  {
    var removedCount = 0;
    foreach (var item in userRoles)
    {
      var existing = await userRoleRepository.GetByKeysAsync(item.UserId, item.RoleId);
      if (existing is not null && !existing.System)
      {
        userRoleRepository.RemoveRelationship(existing);
        removedCount++;
      }
    }
    if (removedCount > 0)
      await unitOfWork.SaveChangesAsync();

    return removedCount;
  }

  public async Task ActivateAsync(UserRole userRole)
  {
    var existing = await userRoleRepository.GetByKeysAsync(userRole.UserId, userRole.RoleId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    existing.Inactive = false;
    userRoleRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(UserRole userRole)
  {
    var existing = await userRoleRepository.GetByKeysAsync(userRole.UserId, userRole.RoleId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido desativar um perfil nativo do sistema.");

    existing.Inactive = true;
    userRoleRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}

