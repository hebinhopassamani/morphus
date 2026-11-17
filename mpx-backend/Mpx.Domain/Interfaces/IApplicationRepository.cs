using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IApplicationRepository : IMorphusRepository<MorphusApplication>
{
  Task<List<MorphusApplication>> GetListAsync();
  Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId);
  Task<MorphusApplication?> GetByKeyAsync(string key);
  Task<List<Category>> GetCategoriesAsync();
  Task EnsureInitialWorkspaceAndDashboardForNewAppAsync(MorphusApplication application);
  Task SyncApplicationWorkspacesAsync(Guid applicationId, List<Guid> workspaceIds);
  Task<ApplicationModule> SaveModuleAsync(Guid applicationId, ApplicationModule module);
  Task DeleteModuleAsync(Guid moduleId);
  Task<ApplicationSubModule> SaveSubModulePageAsync(Guid moduleId, ApplicationSubModule page);
  Task DeleteSubModulePageAsync(Guid pageId);
  Task<List<MorphusApplication>> GetAllApplicationsIgnoreFiltersAsync();
  Task<List<CorporationDomain>> GetCorporationDomainsAsync();
  Task<List<CorporationDomain>> GetAllCorporationDomainsIgnoreFiltersAsync();
  Task<CorporationDomain> SaveCorporationDomainAsync(CorporationDomain domain);
  Task<List<ApplicationSetting>> GetApplicationSettingsAsync(Guid applicationId);
  Task<ApplicationSetting> SaveApplicationSettingAsync(Guid applicationId, ApplicationSetting setting);
  Task DeleteApplicationSettingAsync(Guid settingId);
}
