using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class ApplicationHandler(
    IApplicationRepository applicationRepository,
    IApplicationUserRepository applicationUserRepository,
    IUnitOfWork unitOfWork)
{
  public Task<MorphusApplication?> GetByIdAsync(Guid id) => applicationRepository.GetByIdAsync(id);

  public Task<List<MorphusApplication>> GetListAsync() => applicationRepository.GetListAsync();

  public Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId) =>
      applicationRepository.GetByWorkspaceAsync(workspaceId);

  public Task<MorphusApplication?> GetByKeyAsync(string key) => applicationRepository.GetByKeyAsync(key);

  public async Task<MorphusApplication> CreateAsync(MorphusApplication application, Guid creatorUserId)
  {
    if (application.Id == Guid.Empty)
      application.Id = Guid.NewGuid();

    await applicationRepository.AddAsync(application);

    if (creatorUserId != Guid.Empty)
    {
      await applicationUserRepository.AddRelationshipAsync(new ApplicationUser
      {
        ApplicationId = application.Id,
        UserId = creatorUserId,
        IsOwner = true,
        System = false
      });
    }

    await unitOfWork.SaveChangesAsync();
    return application;
  }

  public async Task<MorphusApplication> UpdateAsync(MorphusApplication application)
  {
    applicationRepository.Update(application);
    await unitOfWork.SaveChangesAsync();
    return application;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await applicationRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir uma aplicação padrão do sistema.");

    applicationRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
