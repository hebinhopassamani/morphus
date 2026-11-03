using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class RoleHandler(
    IRoleRepository roleRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<Role>(httpContext)
{
  public Task<Role?> GetByIdAsync(Guid id) => roleRepository.GetByIdAsync(id);

  public Task<List<Role>> GetListAsync() => roleRepository.GetListAsync();

  public async Task<Role> CreateAsync(Role role)
  {
    if (role.Id == Guid.Empty)
      role.Id = Guid.NewGuid();

    await roleRepository.AddAsync(role);
    await unitOfWork.SaveChangesAsync();
    return role;
  }

  public async Task<Role> UpdateAsync(Role role)
  {
    await roleRepository.UpdateNotNull(role, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    return role;
  }

  public async Task DeleteAsync(Guid id)
  {
    var entity = await roleRepository.GetByIdAsync(id);
    if (entity is null)
      return;

    if (entity.System)
      throw new InvalidOperationException("Não é permitido excluir um perfil padrão do sistema.");

    roleRepository.Delete(entity);
    await unitOfWork.SaveChangesAsync();
  }
}
