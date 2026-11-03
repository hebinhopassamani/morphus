using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class UserClaimRepository(MorphusDbContext context) : MorphusRepository<UserClaim>(context), IUserClaimRepository
{
  public async Task<List<Claim>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var relatedClaimIds = await _context.UserClaims
        .AsNoTracking()
        .Where(uc => uc.UserId == userId)
        .Select(uc => uc.ClaimId)
        .ToListAsync();

    var toRelate = _context.Claims.AsNoTracking();

    if (moduleId is not null && moduleId != Guid.Empty)
      toRelate = toRelate.Where(c => c.ModuleId == moduleId);

    if (subModuleId is not null && subModuleId != Guid.Empty)
      toRelate = toRelate.Where(c => c.SubModuleId == subModuleId);

    if (relatedClaimIds.Count > 0)
      toRelate = toRelate.Where(c => !relatedClaimIds.Contains(c.Id));

    return await toRelate
        .OrderBy(c => c.ClaimType)
        .ThenBy(c => c.ClaimValue)
        .ToListAsync();
  }

  public async Task<List<UserClaim>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var query = _context.UserClaims
        .AsNoTracking()
        .Include(uc => uc.User)
        .Include(uc => uc.Claim)
        .Where(uc => uc.UserId == userId);

    if (moduleId is not null && moduleId != Guid.Empty)
      query = query.Where(uc => uc.Claim!.ModuleId == moduleId);

    if (subModuleId is not null && subModuleId != Guid.Empty)
      query = query.Where(uc => uc.Claim!.SubModuleId == subModuleId);

    return await query.ToListAsync();
  }

  public async Task<UserClaim?> GetByKeysAsync(Guid userId, Guid claimId)
  {
    return await _context.UserClaims
        .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ClaimId == claimId);
  }

  public async Task<UserClaim> AddRelationshipAsync(UserClaim entity)
  {
    await _context.UserClaims.AddAsync(entity);
    return entity;
  }

  public UserClaim RemoveRelationship(UserClaim entity)
  {
    _context.UserClaims.Remove(entity);
    return entity;
  }
}

