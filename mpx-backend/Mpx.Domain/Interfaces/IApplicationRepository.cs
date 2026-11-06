using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IApplicationRepository : IMorphusRepository<MorphusApplication>
{
  Task<List<MorphusApplication>> GetListAsync();
  Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId);
  Task<MorphusApplication?> GetByKeyAsync(string key);
  Task<List<Category>> GetCategoriesAsync();
  Task EnsureInitialWorkspaceAndDashboardForNewAppAsync(MorphusApplication application);
  Task<ApplicationModule> SaveModuleAsync(Guid applicationId, ApplicationModule module);
  Task DeleteModuleAsync(Guid moduleId);
  Task<ApplicationSubModule> SaveSubModulePageAsync(Guid moduleId, ApplicationSubModule page);
  Task DeleteSubModulePageAsync(Guid pageId);
}
