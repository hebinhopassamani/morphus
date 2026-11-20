using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IClaimRepository : IMpxRepository<Claim>
{
  Task<List<Claim>> GetListAsync();
}


