using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.Filters;
using Morphus.Domain.CreateAccount;
using Npgsql;

namespace Morphus.Repository;

public class BusinessRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<Business>(mpsContext, httpContext), IBusinessRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task CreateAccount(BusinessUser businessUser)
  {
    var parentBusiness = await GetParentBusiness();

    if (parentBusiness is not null)
    {
      businessUser.Business!.BusinessId = parentBusiness.Id;
    }

    MorphusUsertatus.Generate(businessUser);
    MorphusModules.Generate(businessUser);
    MorphusSubModules.Generate(businessUser);
    MorphusRole.Generate(businessUser);
    MorphusBusiness.Generate(businessUser);
    MorphusUser.Generate(businessUser);
    MorphusBusinessUser.Generate(businessUser);
    MorphusClaim.Generate(businessUser);
    MorphusUserRole.Generate(businessUser);
    MorphusRoleClaim.Generate(businessUser);

    await Create(businessUser.Business!);

    businessUser.BusinessId = businessUser.Business?.Id;
    businessUser.UserId = businessUser.User?.Id;
  }

  public async Task<BusinessUser?> GetAccount(Guid businessId)
  {
    var query = context.BusinessUser
                       .AsNoTracking()
                        .Include(bu => bu.Business)
                        .Include(bu => bu.User)
                       .Where(bu => bu.BusinessId == businessId && bu.IsOwner == true);

    return await query.FirstOrDefaultAsync();
  }

  public async Task UpdateAccount(BusinessUser businessUser)
  {
    await UpdateNotNull(businessUser.Business!, false, businessUser.Business!.Id);
    await UpdateNotNull(businessUser.User!, false, businessUser.User!.Id);
    await UpdateNotNull(businessUser, true, businessUser.UserId, businessUser.BusinessId);
  }

  public async Task<List<Business>> GetList(MorphusFilter? filter)
  {
    List<Guid?> ids = [];

    var parentBusiness = await GetParentBusiness();

    if (parentBusiness is not null)
    {
      ids.Add(parentBusiness.Id);
      ids.AddRange(parentBusiness.Child.Select(b => b.Id));
    }

    var parameters = new List<NpgsqlParameter>();
    var sql = "";

    if (filter is not null)
    {
      parameters = BuildParameters(filter);

      if (!String.IsNullOrEmpty(filter.WhereClause))
      {
        sql = "WHERE " + filter.WhereClause;
      }
    }

    var result = context.Business
                        .FromSqlRaw("SELECT * FROM \"Business\" " + sql, [.. parameters])
                        .Where(b => ids.Contains(b.Id));

    return await result.ToListAsync();
  }

  public async Task<Business?> GetParentBusiness()
  {
    Business? parentBusiness = null;

    var loggedBusiness = await context.Business
                                .Where(b => b.Id == BusinessId)
                                .FirstOrDefaultAsync();

    if (loggedBusiness is not null && loggedBusiness.BusinessId is null)
    {
      parentBusiness = await context.Business
                                      .Include(b => b.Child)
                                    .Where(b => b.Id == loggedBusiness.Id)
                                    .FirstOrDefaultAsync();
    }
    else if (loggedBusiness is not null && loggedBusiness.BusinessId is not null)
    {
      parentBusiness = await context.Business
                                    .Where(b => b.Id == loggedBusiness.BusinessId)
                                    .FirstOrDefaultAsync();
      if (parentBusiness is not null)
      {
        parentBusiness = await context.Business
                                        .Include(b => b.Child)
                                       .Where(b => b.Id == parentBusiness.Id)
                                       .FirstOrDefaultAsync();
      }
    }

    return parentBusiness;
  }
}
