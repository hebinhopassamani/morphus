using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class MenuHandler(IMenuRepository menuRepository, IUnitOfWork unitOfWork)
{
  public Task<Menu?> GetByIdAsync(Guid id) => menuRepository.GetByIdAsync(id);

  public Task<List<Menu>> GetListAsync() => menuRepository.GetListAsync();

  public Task<List<Menu>> GetByApplicationIdAsync(Guid applicationId) =>
      menuRepository.GetByApplicationIdAsync(applicationId);

  public Task<List<Menu>> GetByApplicationKeyAsync(string applicationKey) =>
      menuRepository.GetByApplicationKeyAsync(applicationKey);

  public async Task<Menu> CreateAsync(Menu menu)
  {
    if (menu.Id == Guid.Empty)
      menu.Id = Guid.NewGuid();

    await menuRepository.AddAsync(menu);
    await unitOfWork.SaveChangesAsync();
    return menu;
  }

  public async Task<Menu> UpdateAsync(Menu menu)
  {
    menuRepository.Update(menu);
    await unitOfWork.SaveChangesAsync();
    return menu;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await menuRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir um menu padrão do sistema.");

    menuRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
