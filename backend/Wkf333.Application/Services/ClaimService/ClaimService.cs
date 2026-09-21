using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.ClaimService;

public class ClaimService(IMorphusTransaction mpsTransaction,
                          IClaimRepository mpsClaimReporitory,
                          IHttpContextAccessor httpContext) : MorphusService<Claim>(httpContext), IClaimService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IClaimRepository claimRepository = mpsClaimReporitory;

  public async Task<Claim?> GetById(Guid id)
  {
    var entity = await claimRepository.GetById(id);

    return entity;
  }

  public async Task<List<Claim>> GetList(MorphusFilter? filter)
  {
    var entities = await claimRepository.GetList(filter);

    return entities;
  }

  public async Task<Claim> Create(Claim entity)
  {
    entity = await claimRepository.Create(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<Claim> Update(Claim entity)
  {
    entity = await claimRepository.UpdateNotNull(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Delete(Guid id)
  {
    var result = await claimRepository.Delete(id);

    await transaction.Commit();

    return result;
  }
}
