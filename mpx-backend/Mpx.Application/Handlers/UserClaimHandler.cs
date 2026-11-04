using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class UserClaimHandler(IUserClaimRepository userClaimRepository, IUnitOfWork unitOfWork)
{
  public Task<List<Claim>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null) =>
      userClaimRepository.GetEntitiesToRelateAsync(userId, moduleId, subModuleId, applicationId);

  public Task<List<UserClaim>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId, Guid? applicationId = null) =>
      userClaimRepository.GetRelatedEntitiesAsync(userId, moduleId, subModuleId, applicationId);

  public async Task<UserClaim> AddRelationshipAsync(UserClaim userClaim)
  {
    var existing = await userClaimRepository.GetByKeysAsync(userClaim.UserId, userClaim.ClaimId);
    if (existing is not null)
      return existing;

    await userClaimRepository.AddRelationshipAsync(userClaim);
    await unitOfWork.SaveChangesAsync();
    return userClaim;
  }

  public async Task<List<UserClaim>> AddRelationshipsAsync(List<UserClaim> userClaims)
  {
    var added = new List<UserClaim>();
    foreach (var item in userClaims)
    {
      var existing = await userClaimRepository.GetByKeysAsync(item.UserId, item.ClaimId);
      if (existing is null)
      {
        await userClaimRepository.AddRelationshipAsync(item);
        added.Add(item);
      }
    }
    if (added.Count > 0)
      await unitOfWork.SaveChangesAsync();

    return added;
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

  public async Task<int> RemoveRelationshipsAsync(List<UserClaim> userClaims)
  {
    var removedCount = 0;
    foreach (var item in userClaims)
    {
      var existing = await userClaimRepository.GetByKeysAsync(item.UserId, item.ClaimId);
      if (existing is not null && !existing.System)
      {
        userClaimRepository.RemoveRelationship(existing);
        removedCount++;
      }
    }
    if (removedCount > 0)
      await unitOfWork.SaveChangesAsync();

    return removedCount;
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

