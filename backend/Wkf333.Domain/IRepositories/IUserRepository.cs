using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IUserRepository : IMorphusRepository<User>
{
  Task<List<User>> GetList(MorphusFilter? filter);
  Task<User?> GetByRefreshToken(string refreshToken);
  Task<User?> GetByLogin(string email);
  Task<User?> GetByEmail(string? email);
  Task<bool> ExistsEmail(string email, Guid? userId = null);
}
