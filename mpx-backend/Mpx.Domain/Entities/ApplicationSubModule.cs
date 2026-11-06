using Mpx.Domain.Interfaces;

namespace Mpx.Domain.Entities;

public class ApplicationSubModule : MorphusEntity, IMorphusTenant
{
  public required string Name { get; set; }
  public required string Label { get; set; }
  public string? Icon { get; set; }
  public string? Color { get; set; }
  public int Order { get; set; }
  public string? RoutePattern { get; set; }
  public bool Default { get; set; } = false;
  public string? HtmlContent { get; set; }
  public string? CssContent { get; set; }
  public string? JsContent { get; set; }
  public Guid ApplicationModuleId { get; set; }
  public Guid CorporationId { get; set; }
  public string? Description { get; set; }

  public virtual ApplicationModule? ApplicationModule { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
