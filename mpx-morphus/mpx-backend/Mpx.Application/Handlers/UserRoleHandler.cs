using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class UserRoleHandler(IUserRoleRepository userRoleRepository, IUnitOfWork unitOfWork)
{
  public Task<List<Role>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId) =>
      userRoleRepository.GetEntitiesToRelateAsync(userId, moduleId, subModuleId);

  public Task<List<UserRole>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId) =>
      userRoleRepository.GetRelatedEntitiesAsync(userId, moduleId, subModuleId);

  public async Task<UserRole> AddRelationshipAsync(UserRole userRole)
  {
    await userRoleRepository.AddRelationshipAsync(userRole);
    await unitOfWork.SaveChangesAsync();
    return userRole;
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

