namespace Mpx.Domain.Entities;

public class WorkspaceApplication : MorphusRelatedEntity
{
  public Guid WorkspaceId { get; set; }
  public Guid ApplicationId { get; set; }
  public bool Default { get; set; } = false;
  public DateTime? TrialStartDate { get; set; }
  public int? TrialDays { get; set; }
  public bool TrialUsed { get; set; }
  public Guid? SharedWithWorkspaceId { get; set; }

  public virtual Workspace? Workspace { get; set; }
  public virtual MorphusApplication? Application { get; set; }
  public virtual Corporation? Corporation { get; set; }
}
