using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class WkfTypeConfigActionFileType : MpxRelatedEntity
{
  public Guid WorkflowTypeConfigActionId { get; set; }
  public Guid FileTypeId { get; set; }

  public virtual MpxCorporation? Corporation { get; set; }
  public virtual WkfTypeConfigAction? WorkflowTypeConfigAction { get; set; }
  public virtual MpxFileType? FileType { get; set; }
}
