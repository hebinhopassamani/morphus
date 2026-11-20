using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTypeConfigNotificationConfiguration : IEntityTypeConfiguration<WorkflowTypeConfigNotification>
{
  public void Configure(EntityTypeBuilder<WorkflowTypeConfigNotification> builder)
  {
    builder.ToTable("wkf_workflow_type_config_notifications");
    builder.HasKey(n => n.Id);

    builder.Property(n => n.CorporationId).IsRequired();
    builder.Property(n => n.WorkflowTypeConfigId).IsRequired();
    builder.Property(n => n.WorkflowTypeConfigActionId).IsRequired(false);
    builder.Property(n => n.WorkflowTypeConfigSlaId).IsRequired(false);
    builder.Property(n => n.TriggerEvent).IsRequired().HasMaxLength(60).HasDefaultValue("OnEnter");
    builder.Property(n => n.TargetRoleId).IsRequired(false);
    builder.Property(n => n.TargetUserId).IsRequired(false);
    builder.Property(n => n.TargetEmail).IsRequired(false).HasMaxLength(200);
    builder.Property(n => n.EntityEmailPropertyPath).IsRequired(false).HasMaxLength(200);
    builder.Property(n => n.NotifyRoleEmail).IsRequired().HasDefaultValue(false);
    builder.Property(n => n.NotifyRoleUsers).IsRequired().HasDefaultValue(false);
    builder.Property(n => n.NotifyCorporationEmail).IsRequired().HasDefaultValue(false);
    builder.Property(n => n.NotifyTaskOwners).IsRequired().HasDefaultValue(false);
    builder.Property(n => n.NotifyWorkflowStarter).IsRequired().HasDefaultValue(false);
    builder.Property(n => n.NotifyPreviousStepExecutor).IsRequired().HasDefaultValue(false);
    builder.Property(n => n.CcRoleId).IsRequired(false);
    builder.Property(n => n.CcEmails).IsRequired(false).HasColumnType("text");
    builder.Property(n => n.BccRoleId).IsRequired(false);
    builder.Property(n => n.BccUserId).IsRequired(false);
    builder.Property(n => n.BccEmails).IsRequired(false).HasColumnType("text");
    builder.Property(n => n.AttachWorkflowFiles).IsRequired().HasDefaultValue(false);
    builder.Property(n => n.AttachmentKeys).IsRequired(false).HasColumnType("text");
    builder.Property(n => n.AttachmentTagFilter).IsRequired(false).HasMaxLength(150);
    builder.Property(n => n.AttachmentFromConfigId).IsRequired(false);
    builder.Property(n => n.AttachmentFilterWhereClause).IsRequired(false).HasColumnType("text");
    builder.Property(n => n.RepeatIntervalMinutes).IsRequired(false);
    builder.Property(n => n.Channel).IsRequired().HasMaxLength(40).HasDefaultValue("Both");
    builder.Property(n => n.TemplateKey).IsRequired(false).HasMaxLength(120);
    builder.Property(n => n.SubjectTemplate).IsRequired(false).HasMaxLength(300);
    builder.Property(n => n.MessageTemplate).IsRequired(false).HasColumnType("text");

    builder.HasOne(n => n.Corporation)
           .WithMany()
           .HasForeignKey(n => n.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(n => n.WorkflowTypeConfig)
           .WithMany(c => c.Notifications)
           .HasForeignKey(n => n.WorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(n => n.WorkflowTypeConfigAction)
           .WithMany()
           .HasForeignKey(n => n.WorkflowTypeConfigActionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.WorkflowTypeConfigSla)
           .WithMany(s => s.Notifications)
           .HasForeignKey(n => n.WorkflowTypeConfigSlaId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.TargetRole)
           .WithMany()
           .HasForeignKey(n => n.TargetRoleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.TargetUser)
           .WithMany()
           .HasForeignKey(n => n.TargetUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.CcRole)
           .WithMany()
           .HasForeignKey(n => n.CcRoleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.BccRole)
           .WithMany()
           .HasForeignKey(n => n.BccRoleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.BccUser)
           .WithMany()
           .HasForeignKey(n => n.BccUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
