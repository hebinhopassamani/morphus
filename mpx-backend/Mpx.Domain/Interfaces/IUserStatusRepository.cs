using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IUserStatusRepository : IMpxRepository<UserStatus>
{
  Task<List<UserStatus>> GetListAsync();
}

