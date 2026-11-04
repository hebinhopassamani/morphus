using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class CorporationUserRepository(MorphusDbContext context) : MorphusRepository<CorporationUser>(context), ICorporationUserRepository
{
  public async Task<List<User>> GetEntitiesToRelateAsync(Guid corporationId)
  {
    var currentCorpId = _context.CurrentCorporationId;

    var relatedUserIds = await _context.CorporationUsers
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(cu => cu.CorporationId == corporationId)
        .Select(cu => cu.UserId)
        .ToListAsync();

    return await _context.Users
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(u =>
            !u.Inactive &&
            !relatedUserIds.Contains(u.Id) &&
            (u.CorporationId == currentCorpId ||
             u.CorporationId == corporationId ||
             u.CorporationUsers.Any(cu => (cu.CorporationId == currentCorpId || cu.CorporationId == corporationId) && !cu.Inactive)))
        .OrderBy(u => u.Name)
        .ToListAsync();
  }

  public async Task<List<CorporationUser>> GetRelatedEntitiesAsync(Guid corporationId)
  {
    return await _context.CorporationUsers
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Include(cu => cu.User)
        .Include(cu => cu.Corporation)
        .Where(cu => cu.CorporationId == corporationId)
        .OrderBy(cu => cu.User!.Name)
        .ToListAsync();
  }

  public async Task<CorporationUser?> GetByKeysAsync(Guid corporationId, Guid userId)
  {
    return await _context.CorporationUsers
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(cu => cu.CorporationId == corporationId && cu.UserId == userId);
  }

  public async Task<CorporationUser> AddRelationshipAsync(CorporationUser entity)
  {
    await _context.CorporationUsers.AddAsync(entity);
    return entity;
  }

  public CorporationUser RemoveRelationship(CorporationUser entity)
  {
    _context.CorporationUsers.Remove(entity);
    return entity;
  }
}

