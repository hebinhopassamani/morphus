using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class MpxCorporation : MpxEntity
{
  public required string Name { get; set; }
  public required string Email { get; set; }
  public string PersonType { get; set; } = "PJ";
  public string? CpfCnpj { get; set; }
  public string? FullName { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string? Description { get; set; }
  public Guid? CorporationId { get; set; }

  public virtual MpxCorporation? ParentCorporation { get; set; }

  public virtual ICollection<MpxWorkspace> Workspaces { get; set; } = [];
  public virtual ICollection<MpxWorkspaceUser> WorkspaceUsers { get; set; } = [];
  public virtual ICollection<MpxWorkspaceApplication> WorkspaceApplications { get; set; } = [];
  public virtual ICollection<MpxApplication> Applications { get; set; } = [];
  public virtual ICollection<MpxCategory> Categories { get; set; } = [];
  public virtual ICollection<MpxApplicationStatus> ApplicationStatuses { get; set; } = [];
  public virtual ICollection<MpxApplicationModule> ApplicationModules { get; set; } = [];
  public virtual ICollection<MpxApplicationSubModule> ApplicationSubModules { get; set; } = [];
  public virtual ICollection<MpxApplicationSetting> ApplicationSettings { get; set; } = [];
  public virtual ICollection<MpxCorporationDomain> CorporationDomains { get; set; } = [];
  public virtual ICollection<MpxCorporationDomainRecord> CorporationDomainRecords { get; set; } = [];
  public virtual ICollection<MpxApplicationUser> ApplicationUsers { get; set; } = [];
  public virtual ICollection<SecUser> Users { get; set; } = [];
  public virtual ICollection<MpxCorporationUser> CorporationUsers { get; set; } = [];
  public virtual ICollection<SecUserStatus> UserStatus { get; set; } = [];
  public virtual ICollection<SecModule> Modules { get; set; } = [];
  public virtual ICollection<SecSubModule> SubModules { get; set; } = [];
  public virtual ICollection<MpxMenu> Menus { get; set; } = [];
  public virtual ICollection<SecRole> Roles { get; set; } = [];
  public virtual ICollection<SecClaim> Claims { get; set; } = [];
  public virtual ICollection<SecRoleClaim> RoleClaims { get; set; } = [];
  public virtual ICollection<SecUserRole> UserRoles { get; set; } = [];
  public virtual ICollection<SecUserClaim> UserClaims { get; set; } = [];
  public virtual ICollection<MpxCorporation> Corporations { get; set; } = [];
  public virtual ICollection<RlyEmail> Emails { get; set; } = [];
  public virtual ICollection<RlyEmailTo> EmailsTo { get; set; } = [];
  public virtual ICollection<RlyEmailFrom> EmailsFrom { get; set; } = [];
  public virtual ICollection<RlyEmailCc> EmailsCc { get; set; } = [];
  public virtual ICollection<RlyEmailBcc> EmailsBcc { get; set; } = [];
}

