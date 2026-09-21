using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusBusinessUser
{
  public static void Generate(BusinessUser businessUser)
  {
    var newBusinessUser = new BusinessUser
    {
      Inactive = false,
      System = true,
      IsOwner = true,
      User = businessUser.User
    };

    businessUser.Business!.BusinessUsers.Add(newBusinessUser);
  }
}
