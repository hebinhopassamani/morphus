using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class CorporationUserHandler(ICorporationUserRepository corporationUserRepository, IUnitOfWork unitOfWork)
{
  public Task<List<User>> GetEntitiesToRelateAsync(Guid corporationId) =>
      corporationUserRepository.GetEntitiesToRelateAsync(corporationId);

  public Task<List<CorporationUser>> GetRelatedEntitiesAsync(Guid corporationId) =>
      corporationUserRepository.GetRelatedEntitiesAsync(corporationId);

  public async Task<CorporationUser> AddRelationshipAsync(CorporationUser corporationUser)
  {
    var existing = await corporationUserRepository.GetByKeysAsync(corporationUser.CorporationId, corporationUser.UserId);
    if (existing is not null)
      return existing;

    await corporationUserRepository.AddRelationshipAsync(corporationUser);
    await unitOfWork.SaveChangesAsync();
    return corporationUser;
  }

  public async Task<List<CorporationUser>> AddRelationshipsAsync(List<CorporationUser> items)
  {
    var added = new List<CorporationUser>();
    foreach (var item in items)
    {
      var existing = await corporationUserRepository.GetByKeysAsync(item.CorporationId, item.UserId);
      if (existing is null)
      {
        await corporationUserRepository.AddRelationshipAsync(item);
        added.Add(item);
      }
    }
    if (added.Count > 0)
      await unitOfWork.SaveChangesAsync();

    return added;
  }

  public async Task<CorporationUser> RemoveRelationshipAsync(CorporationUser corporationUser)
  {
    var existing = await corporationUserRepository.GetByKeysAsync(corporationUser.CorporationId, corporationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System || existing.IsOwner)
      throw new InvalidOperationException("Não é permitido remover o proprietário ou vínculo nativo da corporação.");

    corporationUserRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task<int> RemoveRelationshipsAsync(List<CorporationUser> items)
  {
    var removedCount = 0;
    foreach (var item in items)
    {
      var existing = await corporationUserRepository.GetByKeysAsync(item.CorporationId, item.UserId);
      if (existing is not null && !existing.System && !existing.IsOwner)
      {
        corporationUserRepository.RemoveRelationship(existing);
        removedCount++;
      }
    }
    if (removedCount > 0)
      await unitOfWork.SaveChangesAsync();

    return removedCount;
  }

  public async Task ActivateAsync(CorporationUser corporationUser)
  {
    var existing = await corporationUserRepository.GetByKeysAsync(corporationUser.CorporationId, corporationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    existing.Inactive = false;
    corporationUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(CorporationUser corporationUser)
  {
    var existing = await corporationUserRepository.GetByKeysAsync(corporationUser.CorporationId, corporationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System || existing.IsOwner)
      throw new InvalidOperationException("Não é permitido desativar o proprietário da corporação.");

    existing.Inactive = true;
    corporationUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task SetOwnerAsync(CorporationUser corporationUser, bool isOwner)
  {
    var existing = await corporationUserRepository.GetByKeysAsync(corporationUser.CorporationId, corporationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System && !isOwner)
      throw new InvalidOperationException("Não é permitido remover a propriedade do usuário fundador do sistema.");

    existing.IsOwner = isOwner;
    corporationUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}

