using Microsoft.AspNetCore.Http;
using mpx.Domain.Interfaces;
using Mpx.Application.MorphusHandler;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;

namespace Mpx.Application.Handlers;

public class UserHandler(
    IUserRepository userRepository,
    ICorporationUserRepository corporationUserRepository,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContext)
    : MorphusHandler<User>(httpContext)
{
  public Task<User?> GetByIdAsync(Guid id) => userRepository.GetByIdAsync(id);

  public Task<List<User>> GetListAsync() => userRepository.GetListAsync();

  public async Task<User> CreateAsync(User user, string? plainPassword = null)
  {
    if (string.IsNullOrWhiteSpace(user.Email))
      throw new ArgumentException("O e-mail do usuário é obrigatório.");

    if (await userRepository.ExistsEmailAsync(user.Email))
      throw new InvalidOperationException("Já existe um usuário com este e-mail.");

    if (user.Id == Guid.Empty)
      user.Id = Guid.NewGuid();

    user.Email = user.Email.Trim().ToLowerInvariant();
    user.OnboardingCompleted = true;
    user.EmailConfirmed = true;
    user.TermsConfirmed = true;

    if ((user.CorporationId is null || user.CorporationId == Guid.Empty) && CorporationId is not null && CorporationId != Guid.Empty)
    {
      user.CorporationId = CorporationId;
    }

    if (!string.IsNullOrWhiteSpace(plainPassword))
    {
      user.PasswordHash = MorphusSecurity.HashPassword(plainPassword);
    }

    await userRepository.AddAsync(user);

    if (user.CorporationId is not null && user.CorporationId != Guid.Empty)
    {
      await corporationUserRepository.AddRelationshipAsync(new CorporationUser
      {
        CorporationId = user.CorporationId.Value,
        UserId = user.Id,
        Inactive = false,
        System = false,
        IsOwner = false
      });
    }

    await unitOfWork.SaveChangesAsync();
    return user;
  }

  public async Task<User> UpdateAsync(User user, string? newPlainPassword = null)
  {
    var existing = await userRepository.GetByIdAsync(user.Id)
        ?? throw new KeyNotFoundException("Usuário não encontrado.");

    existing.Name = user.Name;
    existing.NickName = user.NickName;
    existing.PhoneNumber = user.PhoneNumber;
    existing.Picture = user.Picture;
    existing.Website = user.Website;
    existing.Gender = user.Gender;
    existing.Birthdate = user.Birthdate;
    existing.Inactive = user.Inactive;
    existing.UserStatusId = user.UserStatusId;

    if (!string.IsNullOrWhiteSpace(newPlainPassword))
    {
      existing.PasswordHash = MorphusSecurity.HashPassword(newPlainPassword);
    }

    userRepository.Update(existing);
    await unitOfWork.SaveChangesAsync();
    return existing;
  }

  public async Task DeleteAsync(Guid id)
  {
    var existing = await userRepository.GetByIdAsync(id);
    if (existing is null)
      return;

    if (existing.System)
      throw new InvalidOperationException("Não é permitido excluir um usuário padrão do sistema.");

    userRepository.Delete(existing);
    await unitOfWork.SaveChangesAsync();
  }
}

