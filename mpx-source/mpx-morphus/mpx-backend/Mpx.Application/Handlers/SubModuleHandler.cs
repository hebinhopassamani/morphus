using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class SubModuleHandler(ISubModuleRepository subModuleRepository, IUnitOfWork unitOfWork)
{
  public Task<SubModule?> GetByIdAsync(Guid id) => subModuleRepository.GetByIdAsync(id);

  public Task<List<SubModule>> GetListAsync() => subModuleRepository.GetListAsync();

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
    subModuleRepository.Update(subModule);
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

    subModuleRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}

