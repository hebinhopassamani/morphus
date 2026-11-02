using Microsoft.EntityFrameworkCore;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class WorkspaceApplicationRepository(MorphusDbContext context)
    : MorphusRepository<WorkspaceApplication>(context), IWorkspaceApplicationRepository
{
  public async Task<List<MorphusApplication>> GetEntitiesToRelateAsync(Guid workspaceId)
  {
    var relatedApplicationIds = await _context.WorkspaceApplications
        .AsNoTracking()
        .Where(wa => wa.WorkspaceId == workspaceId)
        .Select(wa => wa.ApplicationId)
        .ToListAsync();

    var toRelate = _context.Applications.AsNoTracking();

    if (relatedApplicationIds.Count > 0)
      toRelate = toRelate.Where(a => !relatedApplicationIds.Contains(a.Id));

    return await toRelate
        .OrderBy(a => a.Name)
        .ToListAsync();
  }

  public async Task<List<WorkspaceApplication>> GetRelatedEntitiesAsync(Guid workspaceId)
  {
    return await _context.WorkspaceApplications
        .AsNoTracking()
        .Include(wa => wa.Workspace)
        .Include(wa => wa.Application)
        .Where(wa => wa.WorkspaceId == workspaceId)
        .OrderBy(wa => wa.Application!.Name)
        .ToListAsync();
  }

  public async Task<WorkspaceApplication?> GetByKeysAsync(Guid workspaceId, Guid applicationId)
  {
    return await _context.WorkspaceApplications
        .FirstOrDefaultAsync(wa => wa.WorkspaceId == workspaceId && wa.ApplicationId == applicationId);
  }

  public async Task<WorkspaceApplication> AddRelationshipAsync(WorkspaceApplication entity)
  {
    await _context.WorkspaceApplications.AddAsync(entity);
    return entity;
  }

  public WorkspaceApplication RemoveRelationship(WorkspaceApplication entity)
  {
    _context.WorkspaceApplications.Remove(entity);
    return entity;
  }
}
