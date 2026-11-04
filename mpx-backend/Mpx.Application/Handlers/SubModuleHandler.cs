using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class SubModuleHandler(
    ISubModuleRepository subModuleRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<SubModule>(httpContext)
{
  public Task<SubModule?> GetByIdAsync(Guid id) => subModuleRepository.GetByIdAsync(id);

  public Task<List<SubModule>> GetListAsync() => subModuleRepository.GetListAsync();

  public Task<List<SubModule>> GetByModuleIdAsync(Guid moduleId) => subModuleRepository.GetByModuleIdAsync(moduleId);

  public async Task<SubModule> CreateAsync(SubModule subModule)
  {
    if (subModule.Id == Guid.Empty)
      subModule.Id = Guid.NewGuid();

    await subModuleRepository.AddAsync(subModule);
    await unitOfWork.SaveChangesAsync();
    return subModule;
  }

  public async Task<SubModule> UpdateAsync(SubModule subModule)
  {
    var existing = await subModuleRepository.GetByIdAsync(subModule.Id)
        ?? throw new KeyNotFoundException("Submódulo não encontrado.");

    if (subModule.ModuleId != Guid.Empty && subModule.ModuleId != existing.ModuleId)
      throw new InvalidOperationException("Não é permitido alterar o módulo de um submódulo existente.");

    subModule.ModuleId = existing.ModuleId;
    await subModuleRepository.UpdateNotNull(subModule, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    return subModule;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await subModuleRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir um submódulo padrão do sistema.");

    if (await subModuleRepository.HasDependenciesAsync(id))
      throw new InvalidOperationException("Não é permitido excluir este submódulo pois existem perfis ou permissões vinculados a ele.");

    subModuleRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
