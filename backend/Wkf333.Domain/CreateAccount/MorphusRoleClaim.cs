using Morphus.Domain.Entities.Models;

namespace Morphus.Domain.CreateAccount;

public static class MorphusRoleClaim
{
  public static void Generate(BusinessUser businessUser)
  {
    foreach (var claim in businessUser.Business!.Claims)
    {
      var roleClaim = new RoleClaim
      {
        Inactive = false,
        System = true,
        Role = businessUser.Business.Roles[0],
        Claim = claim
      };

      claim.RoleClaims.Add(roleClaim);
      businessUser.Business!.Roles[0].RoleClaims.Add(roleClaim);
    }
  }
}
