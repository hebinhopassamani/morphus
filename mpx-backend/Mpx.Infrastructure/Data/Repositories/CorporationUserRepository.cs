using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class CorporationUserRepository(MorphusDbContext context) : MorphusRepository<CorporationUser>(context), ICorporationUserRepository
{
  public async Task<List<User>> GetEntitiesToRelateAsync(Guid corporationId)
  {
    var relatedUserIds = await _context.CorporationUsers
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(cu => cu.CorporationId == corporationId)
        .Select(cu => cu.UserId)
        .ToListAsync();

    return await _context.Users
        .AsNoTracking()
        .Where(u => !relatedUserIds.Contains(u.Id))
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

