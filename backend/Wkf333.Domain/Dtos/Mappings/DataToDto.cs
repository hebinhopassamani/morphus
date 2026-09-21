using AutoMapper;
using Morphus.Domain.Dtos.Account;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Dtos.Mappings;

public class DataToDto : Profile
{
  public DataToDto()
  {
    CreateMap<BusinessUser, AccountDTO>().ReverseMap();
    CreateMap<Business, BusinessAccountDTO>().ReverseMap();
    CreateMap<User, UserAccountDTO>().ReverseMap();
  }
}
