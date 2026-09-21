using Morphus.Core.MorphusEntity;

namespace Morphus.Domain.Entities.Models;

public class User : MorphusEntity
{
  public User()
  {
    BusinessUsers = [];
    UserClaims = [];
    UserRoles = [];
  }

  public string? Name { get; set; }
  public string? Email { get; set; }
  public bool Inactive { get; set; }
  public bool System { get; set; }
  public bool TermsConfirmed { get; set; }
  public bool EmailConfirmed { get; set; }
  public bool PhoneConfirmed { get; set; }
  public Guid? UserStatusId { get; set; }
  public string? PasswordHash { get; set; }
  public string? NickName { get; set; }
  public string? PhoneNumber { get; set; }
  public string? Picture { get; set; }
  public string? Website { get; set; }
  public string? Gender { get; set; }
  public string? RefreshToken { get; set; }
  public DateTime? RefreshTokenExpiration { get; set; }
  public DateTime? Birthdate { get; set; }
  public string? SecurityStamp { get; set; }
  public string? ConcurrencyStamp { get; set; }

  public UserStatus? UserStatus { get; set; }

  public List<UserRole> UserRoles { get; set; }
  public List<UserClaim> UserClaims { get; set; }
  public List<BusinessUser> BusinessUsers { get; set; }
}
