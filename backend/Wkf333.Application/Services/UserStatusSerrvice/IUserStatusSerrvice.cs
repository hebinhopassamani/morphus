using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.UserStatusSerrvice;

public interface IUserStatusService : IMorphusService<UserStatus>
{
  Task<UserStatus?> GetById(Guid id);
  Task<List<UserStatus>> GetList();
  Task<UserStatus> Create(UserStatus entity);
  Task<UserStatus> Update(UserStatus entity);
  Task<bool> Delete(Guid id);
}
