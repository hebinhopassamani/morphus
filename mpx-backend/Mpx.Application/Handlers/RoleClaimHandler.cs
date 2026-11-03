using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class RoleClaimHandler(IRoleClaimRepository roleClaimRepository, IUnitOfWork unitOfWork)
{
  public Task<List<Claim>> GetEntitiesToRelateAsync(Guid roleId, Guid? moduleId, Guid? subModuleId) =>
      roleClaimRepository.GetEntitiesToRelateAsync(roleId, moduleId, subModuleId);

  public Task<List<RoleClaim>> GetRelatedEntitiesAsync(Guid roleId, Guid? moduleId, Guid? subModuleId) =>
      roleClaimRepository.GetRelatedEntitiesAsync(roleId, moduleId, subModuleId);

  public async Task<RoleClaim> AddRelationshipAsync(RoleClaim roleClaim)
  {
    await roleClaimRepository.AddRelationshipAsync(roleClaim);
    await unitOfWork.SaveChangesAsync();
    return roleClaim;
  }

  public async Task<RoleClaim> RemoveRelationshipAsync(RoleClaim roleClaim)
  {
    var existing = await roleClaimRepository.GetByKeysAsync(roleClaim.RoleId, roleClaim.ClaimId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido remover uma permissão nativa do sistema.");

    roleClaimRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task ActivateAsync(RoleClaim roleClaim)
  {
    var existing = await roleClaimRepository.GetByKeysAsync(roleClaim.RoleId, roleClaim.ClaimId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    existing.Inactive = false;
    roleClaimRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(RoleClaim roleClaim)
  {
    var existing = await roleClaimRepository.GetByKeysAsync(roleClaim.RoleId, roleClaim.ClaimId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido desativar uma permissão nativa do sistema.");

    existing.Inactive = true;
    roleClaimRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}

