using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.ModuleSerrvice;

public interface IModuleService : IMorphusService<Module>
{
  Task<Module?> GetById(Guid Id);
  Task<List<Module>> GetModulesByKey(string key);
  Task<List<Module>> GetList();
  Task<Module> Create(Module entity);
  Task<Module> Update(Module entity);
  Task<bool> Delete(Guid id);
  Task<List<SubModule>> GetSubModules(Guid id);
}
