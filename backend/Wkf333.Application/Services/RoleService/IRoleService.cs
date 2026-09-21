using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.RoleService;

public interface IRoleService : IMorphusService<Role>
{
  Task<Role?> GetById(Guid Id);
  Task<List<Role>> GetList();
  Task<Role> Create(Role entity);
  Task<Role> Update(Role entity);
  Task<bool> Delete(Guid id);
}
