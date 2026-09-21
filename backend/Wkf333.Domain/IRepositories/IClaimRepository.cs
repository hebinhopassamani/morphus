using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IClaimRepository : IMorphusRepository<Claim>
{
  Task<List<Claim>> GetList(MorphusFilter? filter);
}
