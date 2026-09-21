using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusUserRole
{
  public static void Generate(BusinessUser businessUser)
  {
    var userRole = new UserRole
    {
      Inactive = false,
      System = true,
      User = businessUser.User,
      Role = businessUser.Business!.Roles[0]
    };

    businessUser.User!.UserRoles.Add(userRole);
    businessUser.Business!.Roles[0].UserRoles.Add(userRole);
  }
}
