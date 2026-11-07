using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class ApplicationUserRepository(MorphusDbContext context) : MorphusRepository<ApplicationUser>(context), IApplicationUserRepository
{
  public async Task<List<User>> GetEntitiesToRelateAsync(Guid applicationId)
  {
    var currentCorpId = _context.CurrentCorporationId;

    var relatedUserIds = await _context.ApplicationUsers
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(au => au.ApplicationId == applicationId)
        .Select(au => au.UserId)
        .ToListAsync();

    return await _context.Users
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Where(u =>
            !u.Inactive &&
            !relatedUserIds.Contains(u.Id) &&
            (u.CorporationId == currentCorpId ||
             u.CorporationUsers.Any(cu => cu.CorporationId == currentCorpId && !cu.Inactive)))
        .OrderBy(u => u.Name)
        .ToListAsync();
  }

  public async Task<List<ApplicationUser>> GetRelatedEntitiesAsync(Guid applicationId)
  {
    return await _context.ApplicationUsers
        .IgnoreQueryFilters()
        .AsNoTracking()
        .Include(au => au.User)
        .Include(au => au.Application)
        .Where(au => au.ApplicationId == applicationId)
        .OrderBy(au => au.User!.Name)
        .ToListAsync();
  }

  public async Task<ApplicationUser?> GetByKeysAsync(Guid applicationId, Guid userId)
  {
    return await _context.ApplicationUsers
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(au => au.ApplicationId == applicationId && au.UserId == userId);
  }

  public async Task<ApplicationUser> AddRelationshipAsync(ApplicationUser entity)
  {
    await _context.ApplicationUsers.AddAsync(entity);
    return entity;
  }

  public ApplicationUser RemoveRelationship(ApplicationUser entity)
  {
    _context.ApplicationUsers.Remove(entity);
    return entity;
  }
}
