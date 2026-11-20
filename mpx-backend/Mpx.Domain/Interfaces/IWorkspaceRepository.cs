using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IWorkspaceRepository : IMpxRepository<Workspace>
{
  Task<List<Workspace>> GetListAsync();
  Task<Workspace?> GetByKeyAsync(string key);
  Task ClearDefaultsExceptAsync(Guid excludeWorkspaceId);
  Task EnsureDefaultWorkspaceExistsAsync(Guid? preferredFallbackId = null);
}

