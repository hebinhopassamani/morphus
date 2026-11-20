using Mpx.Core.Entities;

namespace Mpx.Domain.Entities;

public class WorkspaceApplication : MpxRelatedEntity
{
  public Guid WorkspaceId { get; set; }
  public Guid ApplicationId { get; set; }
  public bool Default { get; set; } = false;
  public DateTime? TrialStartDate { get; set; }
  public int? TrialDays { get; set; }
  public bool TrialUsed { get; set; }
  public Guid? SharedWithWorkspaceId { get; set; }

  public virtual Workspace? Workspace { get; set; }
  public virtual Application? Application { get; set; }
  public virtual Corporation? Corporation { get; set; }
}

