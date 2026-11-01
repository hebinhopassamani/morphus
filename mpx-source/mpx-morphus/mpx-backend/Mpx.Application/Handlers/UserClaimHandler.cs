using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class UserClaimHandler(IUserClaimRepository userClaimRepository, IUnitOfWork unitOfWork)
{
  public Task<List<Claim>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId) =>
      userClaimRepository.GetEntitiesToRelateAsync(userId, moduleId, subModuleId);

  public Task<List<UserClaim>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId) =>
      userClaimRepository.GetRelatedEntitiesAsync(userId, moduleId, subModuleId);

  public async Task<UserClaim> AddRelationshipAsync(UserClaim userClaim)
  {
    await userClaimRepository.AddRelationshipAsync(userClaim);
    await unitOfWork.SaveChangesAsync();
    return userClaim;
  }

  public async Task<UserClaim> RemoveRelationshipAsync(UserClaim userClaim)
  {
    var existing = await userClaimRepository.GetByKeysAsync(userClaim.UserId, userClaim.ClaimId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido remover uma permissão nativa do sistema.");

    userClaimRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task ActivateAsync(UserClaim userClaim)
  {
    var existing = await userClaimRepository.GetByKeysAsync(userClaim.UserId, userClaim.ClaimId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    existing.Inactive = false;
    userClaimRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(UserClaim userClaim)
  {
    var existing = await userClaimRepository.GetByKeysAsync(userClaim.UserId, userClaim.ClaimId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System)
      throw new InvalidOperationException("Não é permitido desativar uma permissão nativa do sistema.");

    existing.Inactive = true;
    userClaimRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}

