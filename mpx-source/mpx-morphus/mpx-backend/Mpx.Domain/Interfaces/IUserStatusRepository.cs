using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IUserStatusRepository : IMorphusRepository<UserStatus>
{
  Task<List<UserStatus>> GetListAsync();
}
