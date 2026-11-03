using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Application.Handlers;

public class UserStatusHandler(
    IUserStatusRepository userStatusRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<UserStatus>(httpContext)
{
  public Task<UserStatus?> GetByIdAsync(Guid id) => userStatusRepository.GetByIdAsync(id);

  public Task<List<UserStatus>> GetListAsync() => userStatusRepository.GetListAsync();

  public async Task<UserStatus> CreateAsync(UserStatus userStatus)
  {
    if (userStatus.Id == Guid.Empty)
      userStatus.Id = Guid.NewGuid();

    await userStatusRepository.AddAsync(userStatus);
    await unitOfWork.SaveChangesAsync();
    return userStatus;
  }

  public async Task<UserStatus> UpdateAsync(UserStatus userStatus)
  {
    await userStatusRepository.UpdateNotNull(userStatus, updateCorporationId: false);
    await unitOfWork.SaveChangesAsync();
    return userStatus;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await userStatusRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir um status padrão do sistema.");

    userStatusRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}
