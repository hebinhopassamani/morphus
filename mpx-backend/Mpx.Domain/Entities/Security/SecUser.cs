using System.Text.Json.Serialization;

using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class SecUser : MpxEntity
{
  public required string? Name { get; set; }
  public string? FirstName { get; set; }
  public string? LastName { get; set; }
  public required string? Email { get; set; }
  public bool EmailConfirmed { get; set; }
  public bool PhoneConfirmed { get; set; }
  public bool TermsConfirmed { get; set; }
  public bool OnboardingCompleted { get; set; }
  public Guid? UserStatusId { get; set; }
  public Guid? CorporationId { get; set; }

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

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual SecUserStatus? UserStatus { get; set; }

  public virtual ICollection<MpxCorporationUser> CorporationUsers { get; set; } = [];
  public virtual ICollection<MpxWorkspaceUser> WorkspaceUsers { get; set; } = [];
  public virtual ICollection<MpxApplicationUser> ApplicationUsers { get; set; } = [];
  public virtual ICollection<SecUserRole> UserRoles { get; set; } = [];
  public virtual ICollection<SecUserClaim> UserClaims { get; set; } = [];
}

