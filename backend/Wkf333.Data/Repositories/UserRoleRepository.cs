using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class UserRoleRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<UserRole>(mpsContext, httpContext), IUserRoleRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<Role>> GetEntitiesToRelate(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var related = context.UserRole
                          .AsNoTracking()
                            .Include(ur => ur.User)
                            .Include(ur => ur.Role)
                          .Where(ur => ur.UserId == userId && ur.Role!.BusinessId == BusinessId);

    var relatedEntities = await related.ToListAsync();

    var relatedIds = relatedEntities.Select(ur => ur.RoleId);

    var toRelate = context.Role
                          .AsNoTracking()
                          .Where(r => r.BusinessId == BusinessId);

    if (moduleId is not null)
      toRelate = toRelate.Where(r => r.ModuleId == moduleId);

    if (subModuleId is not null)
      toRelate = toRelate.Where(r => r.SubModuleId == subModuleId);

    if (relatedIds.Any())
    {
      toRelate = toRelate.Where(r => !relatedIds.Contains(r.Id));
    }

    return await toRelate.ToListAsync();
  }

  public async Task<List<UserRole>> GetRelatedEntities(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var query = context.UserRole
                       .AsNoTracking()
                        .Include(ur => ur.User)
                        .Include(ur => ur.Role)
                       .Where(ur => ur.UserId == userId && ur.Role!.BusinessId == BusinessId);

    if (moduleId is not null)
      query = query.Where(ur => ur.Role!.ModuleId == moduleId);

    if (subModuleId is not null)
      query = query.Where(ur => ur.Role!.SubModuleId == subModuleId);

    return await query.ToListAsync();
  }

  public async Task<UserRole> AddRelationship(UserRole entity)
  {
    await context.UserRole.AddAsync(entity);

    return entity;
  }

  public UserRole RemoveRelationship(UserRole entity)
  {
    context.UserRole.Remove(entity);

    return entity;
  }
}
