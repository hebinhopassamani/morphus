using AutoMapper;
using Microsoft.AspNetCore.Http;
using Morphus.Application.MorphusService;
using Morphus.Application.Services.BusinessUserService;
using Morphus.Application.Services.security;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.Filters;
using Morphus.Domain.IRepositories;
using Morphus.Domain.ITransaction;

namespace Morphus.Application.Services.BusinessService;

public class BusinessService(IMorphusTransaction mpsTransaction,
                             IBusinessRepository mpsBusinessRepository,
                             ISecurityService mpsSecurityService,
                             IBusinessUserService mpsBusinessUserService,
                             IHttpContextAccessor httpContext,
                             IMapper mpsMapper) : MorphusService<Business>(httpContext), IBusinessService
{
  private readonly IMorphusTransaction transaction = mpsTransaction;
  private readonly IBusinessRepository businessRepository = mpsBusinessRepository;
  private readonly ISecurityService securityService = mpsSecurityService;
  private readonly IBusinessUserService businessUserService = mpsBusinessUserService;
  private readonly IMapper mapper = mpsMapper;

  public async Task<List<Business>> GetList(MorphusFilter? filter)
  {
    var list = await businessRepository.GetList(filter);

    return list;
  }

  public async Task<bool> Delete(Guid id)
  {
    var result = await businessRepository.Delete(id);

    await transaction.Commit();

    return result;
  }
}
