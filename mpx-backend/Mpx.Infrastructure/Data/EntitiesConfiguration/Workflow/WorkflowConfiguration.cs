using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowConfiguration : IEntityTypeConfiguration<Workflow>
{
  public void Configure(EntityTypeBuilder<Workflow> builder)
  {
    builder.ToTable("wkf_workflows");
    builder.HasKey(w => w.Id);

    builder.Property(w => w.CorporationId).IsRequired();
    builder.Property(w => w.WorkflowTypeId).IsRequired();
    builder.Property(w => w.Protocol).IsRequired().HasMaxLength(60);
    builder.Property(w => w.ParentWorkflowId).IsRequired(false);
    builder.Property(w => w.FromWorkflowTypeConfigId).IsRequired(false);
    builder.Property(w => w.ToWorkflowTypeConfigId).IsRequired();
    builder.Property(w => w.WorkflowTypeConfigActionId).IsRequired(false);
    builder.Property(w => w.WorkflowTypeConfigConditionId).IsRequired(false);
    builder.Property(w => w.ExecutedByUserId).IsRequired(false);
    builder.Property(w => w.ExecutedAt).IsRequired();
    builder.Property(w => w.Opinion).IsRequired(false).HasColumnType("text");
    builder.Property(w => w.IpAddress).IsRequired(false).HasMaxLength(60);
    builder.Property(w => w.UserAgent).IsRequired(false).HasMaxLength(300);
    builder.Property(w => w.Status).IsRequired().HasMaxLength(40).HasDefaultValue("Running");
    builder.Property(w => w.IsCurrentStep).IsRequired().HasDefaultValue(true);

    builder.HasIndex(w => new { w.CorporationId, w.Protocol });

    builder.HasOne(w => w.Corporation)
           .WithMany()
           .HasForeignKey(w => w.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.WorkflowType)
           .WithMany(t => t.Workflows)
           .HasForeignKey(w => w.WorkflowTypeId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.ParentWorkflow)
           .WithMany(p => p.ChildWorkflows)
           .HasForeignKey(w => w.ParentWorkflowId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.FromWorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(w => w.FromWorkflowTypeConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.ToWorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(w => w.ToWorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.WorkflowTypeConfigAction)
           .WithMany()
           .HasForeignKey(w => w.WorkflowTypeConfigActionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.WorkflowTypeConfigCondition)
           .WithMany()
           .HasForeignKey(w => w.WorkflowTypeConfigConditionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.ExecutedByUser)
           .WithMany()
           .HasForeignKey(w => w.ExecutedByUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
