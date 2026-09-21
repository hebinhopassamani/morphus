using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class SubModuleRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<SubModule>(mpsContext, httpContext), ISubModuleRepository
{
  protected readonly W3DbContext context = mpsContext;
}
