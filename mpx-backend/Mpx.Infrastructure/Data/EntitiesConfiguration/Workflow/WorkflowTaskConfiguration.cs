using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTaskConfiguration : IEntityTypeConfiguration<WorkflowTask>
{
  public void Configure(EntityTypeBuilder<WorkflowTask> builder)
  {
    builder.ToTable("wkf_workflow_tasks");
    builder.HasKey(t => t.Id);

    builder.Property(t => t.CorporationId).IsRequired();
    builder.Property(t => t.WorkflowId).IsRequired();
    builder.Property(t => t.WorkflowTypeConfigId).IsRequired();
    builder.Property(t => t.TargetRoleId).IsRequired(false);
    builder.Property(t => t.TargetWorkspaceId).IsRequired(false);
    builder.Property(t => t.MaxOwners).IsRequired().HasDefaultValue(1);
    builder.Property(t => t.CurrentOwnersCount).IsRequired().HasDefaultValue(0);
    builder.Property(t => t.CreatedAt).IsRequired();
    builder.Property(t => t.ClaimedAt).IsRequired(false);
    builder.Property(t => t.CompletedAt).IsRequired(false);
    builder.Property(t => t.DueDate).IsRequired(false);
    builder.Property(t => t.RemainingSlaMinutes).IsRequired(false);
    builder.Property(t => t.SlaElapsedPercent).IsRequired().HasDefaultValue(0);
    builder.Property(t => t.SlaSeverity).IsRequired().HasMaxLength(40).HasDefaultValue("success");
    builder.Property(t => t.SlaColor).IsRequired().HasMaxLength(40).HasDefaultValue("green");
    builder.Property(t => t.SlaBreached).IsRequired().HasDefaultValue(false);
    builder.Property(t => t.Status).IsRequired().HasMaxLength(40).HasDefaultValue("PendingGroup");
    builder.Property(t => t.NumRetries).IsRequired().HasDefaultValue(0);
    builder.Property(t => t.NextCheckAt).IsRequired(false);

    builder.HasIndex(t => new { t.Status, t.NextCheckAt });

    builder.HasOne(t => t.Corporation)
           .WithMany()
           .HasForeignKey(t => t.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(t => t.Workflow)
           .WithMany(w => w.Tasks)
           .HasForeignKey(t => t.WorkflowId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(t => t.WorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(t => t.WorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(t => t.TargetRole)
           .WithMany()
           .HasForeignKey(t => t.TargetRoleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(t => t.TargetWorkspace)
           .WithMany()
           .HasForeignKey(t => t.TargetWorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
