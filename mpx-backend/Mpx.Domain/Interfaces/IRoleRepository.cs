using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IRoleRepository : IMorphusRepository<Role>
{
  Task<List<Role>> GetListAsync();
}

