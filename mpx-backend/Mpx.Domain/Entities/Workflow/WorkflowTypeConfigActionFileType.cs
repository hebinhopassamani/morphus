using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class WorkflowTypeConfigActionFileType : MpxRelatedEntity
{
  public Guid WorkflowTypeConfigActionId { get; set; }
  public Guid FileTypeId { get; set; }

  public virtual Corporation? Corporation { get; set; }
  public virtual WorkflowTypeConfigAction? WorkflowTypeConfigAction { get; set; }
  public virtual FileType? FileType { get; set; }
}
