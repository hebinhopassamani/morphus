using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class ApplicationUserHandler(IApplicationUserRepository applicationUserRepository, IUnitOfWork unitOfWork)
{
  public Task<List<User>> GetEntitiesToRelateAsync(Guid applicationId) =>
      applicationUserRepository.GetEntitiesToRelateAsync(applicationId);

  public Task<List<ApplicationUser>> GetRelatedEntitiesAsync(Guid applicationId) =>
      applicationUserRepository.GetRelatedEntitiesAsync(applicationId);

  public async Task<ApplicationUser> AddRelationshipAsync(ApplicationUser applicationUser)
  {
    await applicationUserRepository.AddRelationshipAsync(applicationUser);
    await unitOfWork.SaveChangesAsync();
    return applicationUser;
  }

  public async Task<ApplicationUser> RemoveRelationshipAsync(ApplicationUser applicationUser)
  {
    var existing = await applicationUserRepository.GetByKeysAsync(applicationUser.ApplicationId, applicationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System || existing.IsOwner)
      throw new InvalidOperationException("Não é permitido remover o proprietário ou vínculo nativo da aplicação.");

    applicationUserRepository.RemoveRelationship(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task ActivateAsync(ApplicationUser applicationUser)
  {
    var existing = await applicationUserRepository.GetByKeysAsync(applicationUser.ApplicationId, applicationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    existing.Inactive = false;
    applicationUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task DeactivateAsync(ApplicationUser applicationUser)
  {
    var existing = await applicationUserRepository.GetByKeysAsync(applicationUser.ApplicationId, applicationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System || existing.IsOwner)
      throw new InvalidOperationException("Não é permitido desativar o proprietário da aplicação.");

    existing.Inactive = true;
    applicationUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }

  public async Task SetOwnerAsync(ApplicationUser applicationUser, bool isOwner)
  {
    var existing = await applicationUserRepository.GetByKeysAsync(applicationUser.ApplicationId, applicationUser.UserId)
        ?? throw new KeyNotFoundException("Vínculo não encontrado.");

    if (existing.System && !isOwner)
      throw new InvalidOperationException("Não é permitido remover a propriedade do usuário fundador do sistema.");

    existing.IsOwner = isOwner;
    applicationUserRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
