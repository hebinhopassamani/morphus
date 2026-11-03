using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class ClaimHandler(
    IClaimRepository claimRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<Claim>(httpContext)
{
  public Task<Claim?> GetByIdAsync(Guid id) => claimRepository.GetByIdAsync(id);

  public Task<List<Claim>> GetListAsync() => claimRepository.GetListAsync();

  public async Task<Claim> CreateAsync(Claim claim)
  {
    if (claim.Id == Guid.Empty)
      claim.Id = Guid.NewGuid();

    await claimRepository.AddAsync(claim);
    await unitOfWork.SaveChangesAsync();
    return claim;
  }

  public async Task<Claim> UpdateAsync(Claim claim)
  {
    await claimRepository.UpdateNotNull(claim, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    return claim;
  }

  public async Task DeleteAsync(Guid id)
  {
    var entity = await claimRepository.GetByIdAsync(id);
    if (entity is null)
      return;

    if (entity.System)
      throw new InvalidOperationException("Não é permitido excluir uma permissão padrão do sistema.");

    claimRepository.Delete(entity);
    await unitOfWork.SaveChangesAsync();
  }
}
