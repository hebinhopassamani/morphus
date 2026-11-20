using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IMenuRepository : IMpxRepository<Menu>
{
  Task<List<Menu>> GetListAsync();
  Task<List<Menu>> GetByApplicationIdAsync(Guid applicationId);
  Task<List<Menu>> GetByApplicationKeyAsync(string applicationKey);
}

