using Mpx.Domain.Entities;

namespace Mpx.Domain.Interfaces;

public interface IApplicationRepository : IMorphusRepository<MorphusApplication>
{
  Task<List<MorphusApplication>> GetListAsync();
  Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId);
  Task<MorphusApplication?> GetByKeyAsync(string key);
}
