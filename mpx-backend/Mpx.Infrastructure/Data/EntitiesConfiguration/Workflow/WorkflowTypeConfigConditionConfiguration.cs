using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTypeConfigConditionConfiguration : IEntityTypeConfiguration<WorkflowTypeConfigCondition>
{
  public void Configure(EntityTypeBuilder<WorkflowTypeConfigCondition> builder)
  {
    builder.ToTable("wkf_workflow_type_config_conditions");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.CorporationId).IsRequired();
    builder.Property(c => c.WorkflowTypeConfigId).IsRequired();
    builder.Property(c => c.ConditionType).IsRequired().HasMaxLength(40).HasDefaultValue("If");
    builder.Property(c => c.NextWorkflowTypeConfigId).IsRequired();
    builder.Property(c => c.ElseNextWorkflowTypeConfigId).IsRequired(false);
    builder.Property(c => c.OpenParenthesis).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.PropertyName).IsRequired().HasMaxLength(150);
    builder.Property(c => c.DataType).IsRequired().HasMaxLength(40).HasDefaultValue("text");
    builder.Property(c => c.Operator).IsRequired().HasMaxLength(40);
    builder.Property(c => c.Value).IsRequired(false).HasColumnType("text");
    builder.Property(c => c.CloseParenthesis).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.AndOr).IsRequired(false).HasMaxLength(10);
    builder.Property(c => c.WhereClause).IsRequired(false).HasColumnType("text");
    builder.Property(c => c.CollectionPropertyName).IsRequired(false).HasMaxLength(150);
    builder.Property(c => c.MaxIterations).IsRequired(false);
    builder.Property(c => c.MergeMode).IsRequired(false).HasMaxLength(40);
    builder.Property(c => c.PollIntervalSeconds).IsRequired(false);
    builder.Property(c => c.TimeoutMinutes).IsRequired(false);
    builder.Property(c => c.MaxRetries).IsRequired(false);
    builder.Property(c => c.RetryIntervalSeconds).IsRequired(false);
    builder.Property(c => c.SplitIntoChildWorkflows).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.WaitChildWorkflowsComplete).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.IsCriticalCheck).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.HoldTargetInactive).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.Order).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(c => c.Corporation)
           .WithMany()
           .HasForeignKey(c => c.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.WorkflowTypeConfig)
           .WithMany(cfg => cfg.Conditions)
           .HasForeignKey(c => c.WorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(c => c.NextWorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(c => c.NextWorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.ElseNextWorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(c => c.ElseNextWorkflowTypeConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
