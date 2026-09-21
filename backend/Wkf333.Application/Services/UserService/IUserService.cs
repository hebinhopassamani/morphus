using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;

namespace Morphus.Application.Services.UserService;

public interface IUserService : IMorphusService<User>
{
  Task<User?> GetById(Guid id);
  Task<List<User>> GetList(MorphusFilter? filter);
  Task<User> Create(User entity);
  Task<User> Update(User entity);
  Task<bool> Delete(Guid id);
  Task<bool> ExistsEmail(string email, Guid? userId = null);
}
