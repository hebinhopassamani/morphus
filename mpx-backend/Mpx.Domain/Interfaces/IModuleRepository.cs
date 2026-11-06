using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IModuleRepository : IMorphusRepository<Module>
{
  Task<List<SubModule>> GetSubModulesAsync(Guid id);
  Task<List<Module>> GetModulesByKeyAsync(string key);
  Task<List<Module>> GetByApplicationIdAsync(Guid applicationId);
  Task<List<Module>> GetListAsync();
  Task<bool> HasDependenciesAsync(Guid moduleId);
  Task<DeleteDependenciesSummary> GetDependenciesSummaryAsync(Guid moduleId);
  Task DeleteWithDependenciesAsync(Guid moduleId);
}
