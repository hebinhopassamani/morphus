using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class UserRoleRepository(MorphusDbContext context) : MorphusRepository<UserRole>(context), IUserRoleRepository
{
  public async Task<List<Role>> GetEntitiesToRelateAsync(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var relatedRoleIds = await _context.UserRoles
        .AsNoTracking()
        .Where(ur => ur.UserId == userId)
        .Select(ur => ur.RoleId)
        .ToListAsync();

    var toRelate = _context.Roles.AsNoTracking();

    if (moduleId is not null && moduleId != Guid.Empty)
      toRelate = toRelate.Where(r => r.ModuleId == moduleId);

    if (subModuleId is not null && subModuleId != Guid.Empty)
      toRelate = toRelate.Where(r => r.SubModuleId == subModuleId);

    if (relatedRoleIds.Count > 0)
      toRelate = toRelate.Where(r => !relatedRoleIds.Contains(r.Id));

    return await toRelate
        .OrderBy(r => r.Name)
        .ToListAsync();
  }

  public async Task<List<UserRole>> GetRelatedEntitiesAsync(Guid userId, Guid? moduleId, Guid? subModuleId)
  {
    var query = _context.UserRoles
        .AsNoTracking()
        .Include(ur => ur.User)
        .Include(ur => ur.Role)
        .Where(ur => ur.UserId == userId);

    if (moduleId is not null && moduleId != Guid.Empty)
      query = query.Where(ur => ur.Role!.ModuleId == moduleId);

    if (subModuleId is not null && subModuleId != Guid.Empty)
      query = query.Where(ur => ur.Role!.SubModuleId == subModuleId);

    return await query.ToListAsync();
  }

  public async Task<UserRole?> GetByKeysAsync(Guid userId, Guid roleId)
  {
    return await _context.UserRoles
        .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
  }

  public async Task<UserRole> AddRelationshipAsync(UserRole entity)
  {
    await _context.UserRoles.AddAsync(entity);
    return entity;
  }

  public UserRole RemoveRelationship(UserRole entity)
  {
    _context.UserRoles.Remove(entity);
    return entity;
  }
}

