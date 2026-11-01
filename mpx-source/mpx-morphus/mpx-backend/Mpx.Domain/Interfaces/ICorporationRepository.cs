using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface ICorporationRepository : IMorphusRepository<Corporation>
{
  Task<List<Corporation>> GetListAsync(Guid activeCorporationId);
  Task<Corporation?> GetParentCorporationAsync(Guid activeCorporationId);
}
