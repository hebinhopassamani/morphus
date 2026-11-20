using Mpx.Core.Dtos;
using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface ISubModuleRepository : IMpxRepository<SubModule>
{
  Task<List<SubModule>> GetListAsync();
  Task<List<SubModule>> GetByModuleIdAsync(Guid moduleId);
  Task<bool> HasDependenciesAsync(Guid subModuleId);
  Task<MpxDeleteDependencySummary<SubModule>> GetDependenciesSummaryAsync(Guid subModuleId);
  Task DeleteWithDependenciesAsync(Guid subModuleId);
}

