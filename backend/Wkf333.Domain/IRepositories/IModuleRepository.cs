using Morphus.Domain.Entities.Models;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IModuleRepository : IMorphusRepository<Module>
{
  Task<List<SubModule>> GetSubModules(Guid id);
  Task<List<Module>> GetModulesByKey(string key);
  Task<List<Module>> GetList();
}
