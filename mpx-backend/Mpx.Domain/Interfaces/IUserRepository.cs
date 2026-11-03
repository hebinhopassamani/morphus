using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IUserRepository : IMorphusRepository<User>
{
  Task<List<User>> GetListAsync();
  Task<User?> GetByRefreshTokenAsync(string refreshToken);
  Task<User?> GetByLoginAsync(string email);
  Task<User?> GetByEmailAsync(string? email);
  Task<User?> GetByIdWithAccessAsync(Guid userId);
  Task<bool> ExistsEmailAsync(string email, Guid? userId = null);
}
