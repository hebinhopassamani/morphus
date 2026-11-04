using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class WorkspaceUserRepository(MorphusDbContext context) : MorphusRepository<WorkspaceUser>(context), IWorkspaceUserRepository
{
  public async Task<List<User>> GetEntitiesToRelateAsync(Guid workspaceId)
  {
    var currentCorpId = _context.CurrentCorporationId;

    var relatedUserIds = await _context.WorkspaceUsers
        .AsNoTracking()
        .Where(wu => wu.WorkspaceId == workspaceId)
        .Select(wu => wu.UserId)
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

  public async Task<List<WorkspaceUser>> GetRelatedEntitiesAsync(Guid workspaceId)
  {
    return await _context.WorkspaceUsers
        .AsNoTracking()
        .Include(wu => wu.User)
        .Include(wu => wu.Workspace)
        .Where(wu => wu.WorkspaceId == workspaceId)
        .OrderBy(wu => wu.User!.Name)
        .ToListAsync();
  }

  public async Task<WorkspaceUser?> GetByKeysAsync(Guid workspaceId, Guid userId)
  {
    return await _context.WorkspaceUsers
        .FirstOrDefaultAsync(wu => wu.WorkspaceId == workspaceId && wu.UserId == userId);
  }

  public async Task<WorkspaceUser> AddRelationshipAsync(WorkspaceUser entity)
  {
    await _context.WorkspaceUsers.AddAsync(entity);
    return entity;
  }

  public WorkspaceUser RemoveRelationship(WorkspaceUser entity)
  {
    _context.WorkspaceUsers.Remove(entity);
    return entity;
  }
}
