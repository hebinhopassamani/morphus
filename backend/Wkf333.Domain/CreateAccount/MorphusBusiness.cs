using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusBusiness
{
  public static void Generate(BusinessUser businessUser)
  {
    businessUser.Business!.Email = businessUser.User!.Email;
  }
}
