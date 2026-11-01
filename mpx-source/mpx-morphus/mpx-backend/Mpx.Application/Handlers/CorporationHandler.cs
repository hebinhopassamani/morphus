using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;

namespace Mpx.Application.Handlers;

public class CorporationHandler(
    ICorporationRepository corporationRepository,
    IUnitOfWork unitOfWork)
{
  public Task<Corporation?> GetByIdAsync(Guid id) => corporationRepository.GetByIdAsync(id);

  public Task<List<Corporation>> GetListAsync(Guid activeCorporationId) =>
      corporationRepository.GetListAsync(activeCorporationId);

  public async Task<Corporation> CreateBranchAsync(Corporation corporation, Guid activeCorporationId, Guid? creatorUserId = null)
  {
    var parent = await corporationRepository.GetParentCorporationAsync(activeCorporationId);
    var parentId = parent?.Id ?? activeCorporationId;

    if (creatorUserId is not null && creatorUserId != Guid.Empty)
    {
      var seededBranch = MorphusAccountSeed.CreateCorporationGraphForExistingUser(
          name: corporation.Name,
          email: corporation.Email,
          existingUserId: creatorUserId.Value,
          parentCorporationId: parentId,
          icon: corporation.Icon,
          description: corporation.Description,
          fullName: corporation.FullName,
          isSystem: false);

      await corporationRepository.AddAsync(seededBranch);
      await unitOfWork.SaveChangesAsync();
      return seededBranch;
    }

    if (corporation.Id == Guid.Empty)
      corporation.Id = Guid.NewGuid();

    if (string.IsNullOrWhiteSpace(corporation.Icon))
      corporation.Icon = "building-2";

    corporation.CorporationId = parentId;

    await corporationRepository.AddAsync(corporation);
    await unitOfWork.SaveChangesAsync();
    return corporation;
  }

  public async Task<Corporation> UpdateAsync(Corporation corporation)
  {
    corporationRepository.Update(corporation);
    await unitOfWork.SaveChangesAsync();
    return corporation;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await corporationRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir a corporação matriz do sistema.");

    corporationRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
