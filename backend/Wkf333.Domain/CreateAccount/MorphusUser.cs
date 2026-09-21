using Morphus.Core.MorphusSecurity;
using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusUser
{
  public static void Generate(BusinessUser businessUser)
  {
    businessUser.User = new User
    {
      Name = businessUser.User!.Name,
      Email = businessUser.User!.Email,
      PasswordHash = MorphusSecurity.HashPassword(businessUser.User!.PasswordHash!),
      Inactive = false,
      System = true,
      TermsConfirmed = businessUser.User!.TermsConfirmed,
      UserStatus = businessUser.Business!.UserStatus.Find(u => u.Key == "ACTIVE"),
    };
  }
}
