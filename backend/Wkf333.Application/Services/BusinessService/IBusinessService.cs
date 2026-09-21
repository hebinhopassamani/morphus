using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;

namespace Morphus.Application.Services.BusinessService;

public interface IBusinessService : IMorphusService<Business>
{
  Task<List<Business>> GetList(MorphusFilter? filter);
  Task<bool> Delete(Guid id);
}
