using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface ICorporationUserRepository : IMorphusRepository<CorporationUser>
{
  Task<List<User>> GetEntitiesToRelateAsync(Guid corporationId);
  Task<List<CorporationUser>> GetRelatedEntitiesAsync(Guid corporationId);
  Task<CorporationUser?> GetByKeysAsync(Guid corporationId, Guid userId);
  Task<CorporationUser> AddRelationshipAsync(CorporationUser entity);
  CorporationUser RemoveRelationship(CorporationUser entity);
}

