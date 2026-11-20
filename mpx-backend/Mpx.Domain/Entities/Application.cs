using System.ComponentModel.DataAnnotations.Schema;

using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class Application : MpxEntity, IMpxTenant
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

  public virtual Corporation? Corporation { get; set; }
  public virtual CorporationDomain? CorporationDomain { get; set; }
  public virtual Category? Category { get; set; }
  public virtual ApplicationStatus? ApplicationStatus { get; set; }
  public virtual ICollection<WorkspaceApplication> WorkspaceApplications { get; set; } = [];
  public virtual ICollection<ApplicationModule> ApplicationModules { get; set; } = [];
  public virtual ICollection<ApplicationSetting> ApplicationSettings { get; set; } = [];
  public virtual ICollection<Module> Modules { get; set; } = [];
  public virtual ICollection<Menu> Menus { get; set; } = [];
  public virtual ICollection<ApplicationUser> ApplicationUsers { get; set; } = [];
}

