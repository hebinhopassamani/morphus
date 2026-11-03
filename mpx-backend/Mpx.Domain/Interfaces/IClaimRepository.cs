using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IClaimRepository : IMorphusRepository<Claim>
{
  Task<List<Claim>> GetListAsync();
}

