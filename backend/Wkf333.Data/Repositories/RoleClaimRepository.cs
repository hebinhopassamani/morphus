using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class RoleClaimRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<RoleClaim>(mpsContext, httpContext), IRoleClaimRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<Claim>> GetEntitiesToRelate(Guid roleId, Guid? moduleId, Guid? subModuleId)
  {
    var related = context.RoleClaim
                          .AsNoTracking()
                            .Include(ur => ur.Role)
                            .Include(ur => ur.Claim)
                          .Where(ur => ur.RoleId == roleId && ur.Claim!.BusinessId == BusinessId && ur.Role!.BusinessId == BusinessId);

    var relatedEntities = await related.ToListAsync();

    var relatedIds = relatedEntities.Select(ur => ur.ClaimId);

    var toRelate = context.Claim
                          .AsNoTracking()
                          .Where(c => c.BusinessId == BusinessId);

    if (moduleId is not null)
      toRelate = toRelate.Where(c => c.ModuleId == moduleId);

    if (subModuleId is not null)
      toRelate = toRelate.Where(c => c.SubModuleId == subModuleId);

    if (relatedIds.Any())
    {
      toRelate = toRelate.Where(c => !relatedIds.Contains(c.Id));
    }

    return await toRelate.ToListAsync();
  }

  public async Task<List<RoleClaim>> GetRelatedEntities(Guid roleId, Guid? moduleId, Guid? subModuleId)
  {
    var query = context.RoleClaim
                       .AsNoTracking()
                        .Include(ur => ur.Role)
                        .Include(ur => ur.Claim)
                       .Where(ur => ur.RoleId == roleId && ur.Claim!.BusinessId == BusinessId && ur.Role!.BusinessId == BusinessId);

    if (moduleId is not null)
      query = query.Where(ur => ur.Claim!.ModuleId == moduleId);

    if (subModuleId is not null)
      query = query.Where(ur => ur.Claim!.SubModuleId == subModuleId);

    return await query.ToListAsync();
  }

  public async Task<RoleClaim> AddRelationship(RoleClaim entity)
  {
    await context.RoleClaim.AddAsync(entity);

    return entity;
  }

  public RoleClaim RemoveRelationship(RoleClaim entities)
  {
    context.RoleClaim.Remove(entities);

    return entities;
  }
}
