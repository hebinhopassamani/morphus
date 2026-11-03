using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;

namespace Mpx.Application.Handlers;

public class CorporationHandler(
    ICorporationRepository corporationRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<Corporation>(httpContext)
{
  public Task<Corporation?> GetByIdAsync(Guid id) => corporationRepository.GetByIdAsync(id);

  public Task<List<Corporation>> GetListAsync(Guid? activeCorporationId = null)
  {
    var corpId = activeCorporationId ?? CorporationId ?? Guid.Empty;
    return corporationRepository.GetListAsync(corpId);
  }

  public async Task<Corporation> CreateBranchAsync(
      Corporation corporation,
      Guid? activeCorporationId = null,
      Guid? creatorUserId = null)
  {
    var currentCorpId = activeCorporationId ?? CorporationId ?? Guid.Empty;
    var currentUserId = creatorUserId ?? UserId;

    var parent = await corporationRepository.GetParentCorporationAsync(currentCorpId);
    var parentId = parent?.Id ?? currentCorpId;

    if (currentUserId is not null && currentUserId != Guid.Empty)
    {
      var seededBranch = MorphusAccountSeed.CreateCorporationGraphForExistingUser(
          name: corporation.Name,
          email: corporation.Email,
          existingUserId: currentUserId.Value,
          parentCorporationId: parentId,
          icon: corporation.Icon,
          description: corporation.Description,
          fullName: corporation.FullName,
          isSystem: false,
          key: corporation.Key,
          personType: corporation.PersonType,
          cpfCnpj: corporation.CpfCnpj);

      await corporationRepository.AddAsync(seededBranch);
      await unitOfWork.SaveChangesAsync();

      corporationRepository.ClearNavigationProperties(seededBranch);
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
    await corporationRepository.UpdateNotNull(corporation, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    return corporation;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await corporationRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    corporationRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
