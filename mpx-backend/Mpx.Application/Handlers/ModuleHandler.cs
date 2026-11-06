using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class ModuleHandler(
    IModuleRepository moduleRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<Module>(httpContext)
{
  public Task<Module?> GetByIdAsync(Guid id) => moduleRepository.GetByIdAsync(id);

  public Task<List<Module>> GetListAsync() => moduleRepository.GetListAsync();

  public Task<List<Module>> GetModulesByKeyAsync(string key) => moduleRepository.GetModulesByKeyAsync(key);

  public Task<List<Module>> GetByApplicationIdAsync(Guid applicationId) =>
      moduleRepository.GetByApplicationIdAsync(applicationId);

  public Task<List<SubModule>> GetSubModulesAsync(Guid id) => moduleRepository.GetSubModulesAsync(id);

  public Task<DeleteDependenciesSummary> GetDependenciesSummaryAsync(Guid id) =>
      moduleRepository.GetDependenciesSummaryAsync(id);

  public async Task<Module> CreateAsync(Module module)
  {
    if (module.Id == Guid.Empty)
      module.Id = Guid.NewGuid();

    await moduleRepository.AddAsync(module);
    await unitOfWork.SaveChangesAsync();
    return module;
  }

  public async Task<Module> UpdateAsync(Module module)
  {
    await moduleRepository.UpdateNotNull(module, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    return module;
  }

  public async Task DeleteAsync(Guid id, bool force = false)
  {
    var existing = await moduleRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir um módulo padrão do sistema.");

    if (force)
    {
      await moduleRepository.DeleteWithDependenciesAsync(id);
      await unitOfWork.SaveChangesAsync();
      return;
    }

    if (await moduleRepository.HasDependenciesAsync(id))
      throw new InvalidOperationException("Não é permitido excluir este módulo pois existem submódulos, perfis ou permissões vinculados a ele.");

    moduleRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
