using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class UserClaimRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<UserClaim>(mpsContext, httpContext), IUserClaimRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<Claim>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var related = context.UserClaim
                          .AsNoTracking()
                            .Include(ur => ur.User)
                            .Include(ur => ur.Claim)
                          .Where(ur => ur.UserId == userId && ur.Claim!.BusinessId == BusinessId);

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

  public async Task<List<UserClaim>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var query = context.UserClaim
                       .AsNoTracking()
                        .Include(ur => ur.User)
                        .Include(ur => ur.Claim)
                       .Where(ur => ur.UserId == userId && ur.Claim!.BusinessId == BusinessId);

    if (moduleId is not null)
      query = query.Where(ur => ur.Claim!.ModuleId == moduleId);

    if (subModuleId is not null)
      query = query.Where(ur => ur.Claim!.SubModuleId == subModuleId);

    return await query.ToListAsync();
  }

  public async Task<UserClaim> AddRelationship(UserClaim entity)
  {
    await context.UserClaim.AddAsync(entity);

    return entity;
  }

  public UserClaim RemoveRelationship(UserClaim entity)
  {
    context.UserClaim.Remove(entity);

    return entity;
  }
}
