using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IBusinessRepository : IMorphusRepository<Business>
{
  Task<BusinessUser?> GetAccount(Guid businessId);
  Task CreateAccount(BusinessUser businessUser);
  Task UpdateAccount(BusinessUser businessUser);
  Task<List<Business>> GetList(MorphusFilter? filter);
  Task<Business?> GetParentBusiness();
}
