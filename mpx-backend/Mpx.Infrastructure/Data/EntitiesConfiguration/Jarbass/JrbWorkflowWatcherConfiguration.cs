using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbWorkflowWatcherConfiguration : IEntityTypeConfiguration<JrbWorkflowWatcher>
{
  public void Configure(EntityTypeBuilder<JrbWorkflowWatcher> builder)
  {
    builder.ToTable("jrb_workflow_watchers");
    builder.HasKey(w => w.Id);

    builder.Property(w => w.CorporationId).IsRequired();
    builder.Property(w => w.JarbassAgentId).IsRequired(false);
    builder.Property(w => w.ParentWorkflowId).IsRequired();
    builder.Property(w => w.SplitGroupId).IsRequired(false);
    builder.Property(w => w.SourceWorkflowTypeConfigId).IsRequired(false);
    builder.Property(w => w.JoinWorkflowTypeConfigId).IsRequired();
    builder.Property(w => w.WorkflowTypeConfigConditionId).IsRequired(false);
    builder.Property(w => w.WatcherType).IsRequired().HasMaxLength(40).HasDefaultValue("SplitJoinBarrier");
    builder.Property(w => w.MergeMode).IsRequired().HasMaxLength(40).HasDefaultValue("WaitAll");
    builder.Property(w => w.ExpectedBranchesCount).IsRequired().HasDefaultValue(1);
    builder.Property(w => w.CompletedBranchesCount).IsRequired().HasDefaultValue(0);
    builder.Property(w => w.FailedBranchesCount).IsRequired().HasDefaultValue(0);
    builder.Property(w => w.HoldTargetInactive).IsRequired().HasDefaultValue(true);
    builder.Property(w => w.PollIntervalSeconds).IsRequired().HasDefaultValue(15);
    builder.Property(w => w.NextPollAtUtc).IsRequired();
    builder.Property(w => w.LastPolledAtUtc).IsRequired(false);
    builder.Property(w => w.TimeoutAtUtc).IsRequired(false);
    builder.Property(w => w.RetryCount).IsRequired().HasDefaultValue(0);
    builder.Property(w => w.MaxRetries).IsRequired().HasDefaultValue(3);
    builder.Property(w => w.WatcherStatus).IsRequired().HasMaxLength(40).HasDefaultValue("Watching");
    builder.Property(w => w.JoinedAtUtc).IsRequired(false);
    builder.Property(w => w.EffectiveTrustedJoinedAtUtc).IsRequired(false);
    builder.Property(w => w.CompletedOfflineOnTime).IsRequired().HasDefaultValue(false);
    builder.Property(w => w.BlockingBranchSummary).IsRequired(false).HasMaxLength(1000);
    builder.Property(w => w.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(w => new { w.WatcherStatus, w.NextPollAtUtc });
    builder.HasIndex(w => new { w.ParentWorkflowId, w.SplitGroupId });

    builder.HasOne(w => w.Corporation)
           .WithMany()
           .HasForeignKey(w => w.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.JarbassAgent)
           .WithMany(a => a.WorkflowWatchers)
           .HasForeignKey(w => w.JarbassAgentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(w => w.ParentWorkflow)
           .WithMany()
           .HasForeignKey(w => w.ParentWorkflowId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(w => w.SourceWorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(w => w.SourceWorkflowTypeConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.JoinWorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(w => w.JoinWorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.WorkflowTypeConfigCondition)
           .WithMany()
           .HasForeignKey(w => w.WorkflowTypeConfigConditionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
