using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;

namespace Morphus.Application.Services.ClaimService;

public interface IClaimService : IMorphusService<Claim>
{
  Task<Claim?> GetById(Guid Id);
  Task<List<Claim>> GetList(MorphusFilter? filter);
  Task<Claim> Create(Claim entity);
  Task<Claim> Update(Claim entity);
  Task<bool> Delete(Guid id);
}
