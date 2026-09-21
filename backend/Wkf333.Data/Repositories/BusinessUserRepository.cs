using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class BusinessUserRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<BusinessUser>(mpsContext, httpContext), IBusinessUserRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<User>> GetEntitiesToRelate(Guid businessId)
  {
    var relate = context.BusinessUser
                        .AsNoTracking()
                          .Include(r => r.User)
                          .Include(r => r.Business)
                        .Where(r => r.BusinessId == businessId);

    var relatedEntities = await relate.ToListAsync();

    var relatedIds = relatedEntities.Select(b => b.UserId);

    var toRelate = context.User
                          .AsNoTracking();

    if (relatedIds.Any())
    {
      toRelate = toRelate.Where(b => !relatedIds.Contains(b.Id));
    }

    return await toRelate.ToListAsync();
  }

  public async Task<List<BusinessUser>> GetRelatedEntities(Guid businessId)
  {
    var query = context.BusinessUser
                       .AsNoTracking()
                        .Include(r => r.User)
                        .Include(r => r.Business)
                       .Where(r => r.BusinessId == businessId);

    return await query.ToListAsync();
  }

  public async Task<BusinessUser> AddRelationship(BusinessUser entity)
  {
    await context.BusinessUser.AddAsync(entity);

    return entity;
  }

  public BusinessUser RemoveRelationship(BusinessUser entity)
  {
    context.BusinessUser.Remove(entity);

    return entity;
  }
}
