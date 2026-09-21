using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.SubModuleSerrvice;

public interface ISubModuleService : IMorphusService<SubModule>
{
  Task<SubModule?> GetById(Guid id);
  Task<SubModule> Create(SubModule entity);
  Task<SubModule> Update(SubModule entity);
  Task<bool> Delete(Guid id);
}
