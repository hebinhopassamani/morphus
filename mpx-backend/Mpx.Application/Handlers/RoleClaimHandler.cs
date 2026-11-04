using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class RoleClaimHandler(IRoleClaimRepository roleClaimRepository, IUnitOfWork unitOfWork)
{
  public Task<List<Claim>> GetEntitiesToRelateAsync(Guid roleId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null) =>
      roleClaimRepository.GetEntitiesToRelateAsync(roleId, moduleId, subModuleId, applicationId);

  public Task<List<RoleClaim>> GetRelatedEntitiesAsync(Guid roleId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null) =>
      roleClaimRepository.GetRelatedEntitiesAsync(roleId, moduleId, subModuleId, applicationId);

  public async Task<RoleClaim> AddRelationshipAsync(RoleClaim roleClaim)
  {
    var existing = await roleClaimRepository.GetByKeysAsync(roleClaim.RoleId, roleClaim.ClaimId);
    if (existing is not null)
      return existing;

    await roleClaimRepository.AddRelationshipAsync(roleClaim);
    await unitOfWork.SaveChangesAsync();
    return roleClaim;
  }

  public async Task<List<RoleClaim>> AddRelationshipsAsync(List<RoleClaim> roleClaims)
  {
    var added = new List<RoleClaim>();
    foreach (var item in roleClaims)
    {
      var existing = await roleClaimRepository.GetByKeysAsync(item.RoleId, item.ClaimId);
      if (existing is null)
      {
        await roleClaimRepository.AddRelationshipAsync(item);
        added.Add(item);
      }
    }
    if (added.Count > 0)
      await unitOfWork.SaveChangesAsync();

    return added;
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

  public async Task<int> RemoveRelationshipsAsync(List<RoleClaim> roleClaims)
  {
    var removedCount = 0;
    foreach (var item in roleClaims)
    {
      var existing = await roleClaimRepository.GetByKeysAsync(item.RoleId, item.ClaimId);
      if (existing is not null && !existing.System)
      {
        roleClaimRepository.RemoveRelationship(existing);
        removedCount++;
      }
    }
    if (removedCount > 0)
      await unitOfWork.SaveChangesAsync();

    return removedCount;
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

