using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class RoleClaimRepository(MorphusDbContext context) : MorphusRepository<RoleClaim>(context), IRoleClaimRepository
{
  public async Task<List<Claim>> GetEntitiesToRelateAsync(Guid roleId, Guid? moduleId, Guid? subModuleId)
  {
    var relatedClaimIds = await _context.RoleClaims
        .AsNoTracking()
        .Where(rc => rc.RoleId == roleId)
        .Select(rc => rc.ClaimId)
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

  public async Task<List<RoleClaim>> GetRelatedEntitiesAsync(Guid roleId, Guid? moduleId, Guid? subModuleId)
  {
    var query = _context.RoleClaims
        .AsNoTracking()
        .Include(rc => rc.Role)
        .Include(rc => rc.Claim)
        .Where(rc => rc.RoleId == roleId);

    if (moduleId is not null && moduleId != Guid.Empty)
      query = query.Where(rc => rc.Claim!.ModuleId == moduleId);

    if (subModuleId is not null && subModuleId != Guid.Empty)
      query = query.Where(rc => rc.Claim!.SubModuleId == subModuleId);

    return await query.ToListAsync();
  }

  public async Task<RoleClaim?> GetByKeysAsync(Guid roleId, Guid claimId)
  {
    return await _context.RoleClaims
        .FirstOrDefaultAsync(rc => rc.RoleId == roleId && rc.ClaimId == claimId);
  }

  public async Task<RoleClaim> AddRelationshipAsync(RoleClaim entity)
  {
    await _context.RoleClaims.AddAsync(entity);
    return entity;
  }

  public RoleClaim RemoveRelationship(RoleClaim entity)
  {
    _context.RoleClaims.Remove(entity);
    return entity;
  }
}

