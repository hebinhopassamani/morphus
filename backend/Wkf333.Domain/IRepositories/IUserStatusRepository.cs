using Morphus.Domain.Entities.Models;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IUserStatusRepository : IMorphusRepository<UserStatus>
{
  Task<List<UserStatus>> GetList();
}

