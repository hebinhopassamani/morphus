namespace Mpx.Domain.Entities;

public class DeleteDependenciesSummary
{
  public List<string> SubModules { get; set; } = [];
  public List<string> Roles { get; set; } = [];
  public List<string> Claims { get; set; } = [];
  public bool HasDependencies => SubModules.Count > 0 || Roles.Count > 0 || Claims.Count > 0;
}
