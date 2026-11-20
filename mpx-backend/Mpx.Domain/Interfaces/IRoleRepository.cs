using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IRoleRepository : IMpxRepository<Role>
{
  Task<List<Role>> GetListAsync();
}


