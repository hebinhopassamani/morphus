using Mpx.Core.Entities;
using Mpx.Core.Interfaces;

namespace Mpx.Domain.Entities;

public class FileType : MpxEntity, IMpxTenant
{
  public required string Name { get; set; }
  public required string Extension { get; set; }
  public required string MimeType { get; set; }
  public string Category { get; set; } = "Document";
  public int MaxSizeInMb { get; set; } = 10;
  public Guid CorporationId { get; set; }
  public string? Icon { get; set; }
  public string? Description { get; set; }

  public virtual Corporation? Corporation { get; set; }
}
