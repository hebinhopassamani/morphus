using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IMenuRepository : IMorphusRepository<Menu>
{
  Task<List<Menu>> GetListAsync();
  Task<List<Menu>> GetByApplicationIdAsync(Guid applicationId);
  Task<List<Menu>> GetByApplicationKeyAsync(string applicationKey);
}
