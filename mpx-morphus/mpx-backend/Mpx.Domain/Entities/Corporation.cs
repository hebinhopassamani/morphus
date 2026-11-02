namespace Mpx.Domain.Entities;

public class Corporation
{
  public Guid Id { get; set; }
  public required string Name { get; set; }
  public required string Key { get; set; }
  public required string Email { get; set; }
  public bool System { get; set; }
  public string? FullName { get; set; }
  public string? Icon { get; set; }
  public string? Description { get; set; }
  public Guid? CorporationId { get; set; }

  public virtual Corporation? ParentCorporation { get; set; }

  public virtual ICollection<Workspace> Workspaces { get; set; } = [];
  public virtual ICollection<WorkspaceUser> WorkspaceUsers { get; set; } = [];
  public virtual ICollection<WorkspaceApplication> WorkspaceApplications { get; set; } = [];
  public virtual ICollection<MorphusApplication> Applications { get; set; } = [];
  public virtual ICollection<ApplicationUser> ApplicationUsers { get; set; } = [];
  public virtual ICollection<User> Users { get; set; } = [];
  public virtual ICollection<CorporationUser> CorporationUsers { get; set; } = [];
  public virtual ICollection<UserStatus> UserStatus { get; set; } = [];
  public virtual ICollection<Module> Modules { get; set; } = [];
  public virtual ICollection<SubModule> SubModules { get; set; } = [];
  public virtual ICollection<Menu> Menus { get; set; } = [];
  public virtual ICollection<Role> Roles { get; set; } = [];
  public virtual ICollection<Claim> Claims { get; set; } = [];
  public virtual ICollection<RoleClaim> RoleClaims { get; set; } = [];
  public virtual ICollection<UserRole> UserRoles { get; set; } = [];
  public virtual ICollection<UserClaim> UserClaims { get; set; } = [];
  public virtual ICollection<Corporation> Corporations { get; set; } = [];
  public virtual ICollection<Email> Emails { get; set; } = [];
  public virtual ICollection<EmailTo> EmailsTo { get; set; } = [];
  public virtual ICollection<EmailFrom> EmailsFrom { get; set; } = [];
  public virtual ICollection<EmailCc> EmailsCc { get; set; } = [];
  public virtual ICollection<EmailBcc> EmailsBcc { get; set; } = [];
}
