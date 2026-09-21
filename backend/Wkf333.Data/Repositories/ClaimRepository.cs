using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;
using Morphus.Domain.Filters;
using Npgsql;


namespace Morphus.Repository;

public class ClaimRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<Claim>(mpsContext, httpContext), IClaimRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<Claim>> GetList(MorphusFilter? filter)
  {
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

    var result = context.Claim
                        .FromSqlRaw("SELECT * FROM \"Claim\" " + sql, [.. parameters])
                          .Include(m => m.Module)
                        .Where(e => e.BusinessId == BusinessId);

    return await result.ToListAsync();
  }
}
