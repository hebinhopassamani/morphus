using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.RoleService;

public class RoleService(IMorphusTransaction mpsTransaction,
                         IRoleRepository mpsRoleRepository,
                         IHttpContextAccessor httpContext) : MorphusService<Role>(httpContext), IRoleService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IRoleRepository roleRepository = mpsRoleRepository;

  public async Task<Role?> GetById(Guid id)
  {
    var entity = await roleRepository.GetById(id);

    return entity;
  }

  public async Task<List<Role>> GetList()
  {
    var entities = await roleRepository.GetList();

    return entities;
  }

  public async Task<Role> Create(Role entity)
  {
    entity = await roleRepository.Create(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<Role> Update(Role entity)
  {
    entity = await roleRepository.UpdateNotNull(entity);

    await transaction.Commit();

    return entity;
  }

  public async Task<bool> Delete(Guid id)
  {
    var result = await roleRepository.Delete(id);

    await transaction.Commit();

    return result;
  }
}
