using System.Text.Json.Serialization;
using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class User : IMorphusTenant
{
  public Guid Id { get; set; }
  public required string? Name { get; set; }
  public required string? Email { get; set; }
  public bool Inactive { get; set; }
  public bool EmailConfirmed { get; set; }
  public bool PhoneConfirmed { get; set; }
  public bool TermsConfirmed { get; set; }
  public bool System { get; set; }
  public Guid UserStatusId { get; set; }
  public Guid CorporationId { get; set; }

  [JsonIgnore]
  public string? PasswordHash { get; set; }

  public string? NickName { get; set; }
  public string? Picture { get; set; }
  public string? PhoneNumber { get; set; }
  public string? Website { get; set; }
  public string? Gender { get; set; }
  public DateTime? Birthdate { get; set; }

  [JsonIgnore]
  public string? RefreshToken { get; set; }

  [JsonIgnore]
  public DateTime? RefreshTokenExpiration { get; set; }

  [JsonIgnore]
  public string? SecurityStamp { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual UserStatus? UserStatus { get; set; }

  public virtual ICollection<CorporationUser> CorporationUsers { get; set; } = [];
  public virtual ICollection<WorkspaceUser> WorkspaceUsers { get; set; } = [];
  public virtual ICollection<ApplicationUser> ApplicationUsers { get; set; } = [];
  public virtual ICollection<UserRole> UserRoles { get; set; } = [];
  public virtual ICollection<UserClaim> UserClaims { get; set; } = [];
}
