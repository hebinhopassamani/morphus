using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface ISubModuleRepository : IMorphusRepository<SubModule>
{
  Task<List<SubModule>> GetListAsync();
}
