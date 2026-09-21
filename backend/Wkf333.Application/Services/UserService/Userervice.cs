using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Application.Services.MailSerrvice;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.UserService;

public class UserService(IMorphusTransaction mpsTransaction,
                         IUserRepository mpsUserReporitory,
                         IBusinessUserRepository mpsBusinessUserReporitory,
                         IEmailService mpsEmailService,
                         IWebHostEnvironment mpsEnvironment,
                         IHttpContextAccessor httpContext) : MorphusService<User>(httpContext), IUserService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IUserRepository userReporitory = mpsUserReporitory;
  private readonly IBusinessUserRepository businessUserReporitory = mpsBusinessUserReporitory;
  private readonly IWebHostEnvironment environment = mpsEnvironment;
  private readonly IEmailService emailService = mpsEmailService;

  public async Task<User?> GetById(Guid id)
  {
    var entity = await userReporitory.GetById(id);

    return entity;
  }

  public async Task<List<User>> GetList(MorphusFilter? filter)
  {
    var entities = await userReporitory.GetList(filter);

    return entities;
  }

  public async Task<User> Create(User entity)
  {
    entity = await userReporitory.Create(entity);

    if (BusinessId is not null)
    {
      var businesUser = new BusinessUser
      {
        BusinessId = BusinessId,
        UserId = entity.Id,
        IsOwner = false,
        Inactive = false,
        System = false,
      };

      await businessUserReporitory.Create(businesUser);
    }

    await emailService.MailTo(entity.Email)
                      .Subject("Bem vindo ao Morphus")
                      .LoadHtmlFilte(@"\Emails\User\NewUser.html")
                      .ReplaceHtmlFile("[username]", entity.Name)
                      .ReplaceHtmlFile("[email]", entity.Email)
                      .SendEmailAsync();

    await transaction.Commit();

    return entity;
  }

  public async Task<User> Update(User entity)
  {
    if (entity.Email is not null)
    {
      await userReporitory.UpdateNotNull(entity, false);

      await transaction.Commit();
    }

    return entity;
  }

  public async Task<bool> Delete(Guid id)
  {
    await userReporitory.Delete(id);
    await transaction.Commit();

    return true;
  }

  public async Task<bool> ExistsEmail(string email, Guid? userId)
  {
    var entity = await userReporitory.ExistsEmail(email, userId);

    return entity;
  }
}
