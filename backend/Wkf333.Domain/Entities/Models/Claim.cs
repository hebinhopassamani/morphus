using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class Claim : MorphusEntity
{
  public Claim()
  {
    UserClaims = [];
    RoleClaims = [];
  }

  public string? ClaimType { get; set; }
  public string? ClaimValue { get; set; }
  public bool System { get; set; }
  public Guid? BusinessId { get; set; }
  public Guid? ModuleId { get; set; }
  public Guid? SubModuleId { get; set; }
  public string? Description { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public Business? Business { get; set; }
  public Module? Module { get; set; }
  public SubModule? SubModule { get; set; }

  public List<RoleClaim> RoleClaims { get; set; }
  public List<UserClaim> UserClaims { get; set; }
}
