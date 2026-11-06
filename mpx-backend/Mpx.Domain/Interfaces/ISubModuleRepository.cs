using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface ISubModuleRepository : IMorphusRepository<SubModule>
{
  Task<List<SubModule>> GetListAsync();
  Task<List<SubModule>> GetByModuleIdAsync(Guid moduleId);
  Task<bool> HasDependenciesAsync(Guid subModuleId);
  Task<DeleteDependenciesSummary> GetDependenciesSummaryAsync(Guid subModuleId);
  Task DeleteWithDependenciesAsync(Guid subModuleId);
}
