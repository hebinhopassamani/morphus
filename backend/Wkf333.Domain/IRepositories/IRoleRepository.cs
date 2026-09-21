using Morphus.Domain.Entities.Models;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IRoleRepository : IMorphusRepository<Role>
{
  Task<List<Role>> GetList();
}
