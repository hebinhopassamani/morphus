using System.ComponentModel.DataAnnotations.Schema;

using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class MpxApplication : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public string Prefix { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public string LayoutKey { get; set; } = "sidebar-default";
  public string? CustomLayoutHtml { get; set; }
  public string DomainMode { get; set; } = "MorphusSuggested";
  public string? Subdomain { get; set; }
  public Guid? CorporationDomainId { get; set; }
  public string? FullDomain { get; set; }
  public bool Default { get; set; } = false;
  public bool AvailableForTrial { get; set; } = false;
  public Guid CorporationId { get; set; }
  public Guid? CategoryId { get; set; }
  public Guid? ApplicationStatusId { get; set; }

  [NotMapped]
  public List<Guid>? WorkspaceIds { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual MpxCorporationDomain? CorporationDomain { get; set; }
  public virtual MpxCategory? Category { get; set; }
  public virtual MpxApplicationStatus? ApplicationStatus { get; set; }
  public virtual ICollection<MpxWorkspaceApplication> WorkspaceApplications { get; set; } = [];
  public virtual ICollection<MpxApplicationModule> ApplicationModules { get; set; } = [];
  public virtual ICollection<MpxApplicationSetting> ApplicationSettings { get; set; } = [];
  public virtual ICollection<SecModule> Modules { get; set; } = [];
  public virtual ICollection<MpxMenu> Menus { get; set; } = [];
  public virtual ICollection<MpxApplicationUser> ApplicationUsers { get; set; } = [];
}

