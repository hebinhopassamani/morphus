using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class ApplicationHandler(
    IApplicationRepository applicationRepository,
    IApplicationUserRepository applicationUserRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<MorphusApplication>(httpContext)
{
  public Task<MorphusApplication?> GetByIdAsync(Guid id) => applicationRepository.GetByIdAsync(id);

  public Task<List<MorphusApplication>> GetListAsync() => applicationRepository.GetListAsync();

  public Task<List<MorphusApplication>> GetByWorkspaceAsync(Guid workspaceId) =>
      applicationRepository.GetByWorkspaceAsync(workspaceId);

  public Task<MorphusApplication?> GetByKeyAsync(string key) => applicationRepository.GetByKeyAsync(key);

  public async Task<MorphusApplication> CreateAsync(MorphusApplication application, Guid? creatorUserId = null)
  {
    if (application.Id == Guid.Empty)
      application.Id = Guid.NewGuid();

    await applicationRepository.AddAsync(application);

    var ownerId = creatorUserId is not null && creatorUserId != Guid.Empty
        ? creatorUserId.Value
        : (UserId ?? Guid.Empty);

    if (ownerId != Guid.Empty)
    {
      await applicationUserRepository.AddRelationshipAsync(new ApplicationUser
      {
        ApplicationId = application.Id,
        UserId = ownerId,
        IsOwner = true,
        System = false
      });
    }

    await unitOfWork.SaveChangesAsync();
    return application;
  }

  public async Task<MorphusApplication> UpdateAsync(MorphusApplication application)
  {
    await applicationRepository.UpdateNotNull(application, updateCorporationId: false);
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
