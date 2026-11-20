using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface ICorporationRepository : IMpxRepository<Corporation>
{
  Task<List<Corporation>> GetListAsync(Guid activeCorporationId);
  Task<Corporation?> GetParentCorporationAsync(Guid activeCorporationId);
  Task<Corporation?> GetOnboardingGraphAsync(Guid corporationId);
}

