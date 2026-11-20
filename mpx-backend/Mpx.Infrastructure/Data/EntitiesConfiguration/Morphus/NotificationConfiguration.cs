using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
  public void Configure(EntityTypeBuilder<Notification> builder)
  {
    builder.ToTable("mpx_notifications");
    builder.HasKey(n => n.Id);

    builder.Property(n => n.CorporationId).IsRequired(false);
    builder.Property(n => n.WorkspaceId).IsRequired(false);
    builder.Property(n => n.ApplicationId).IsRequired(false);
    builder.Property(n => n.CreatedByUserId).IsRequired(false);
    builder.Property(n => n.JarbassAgentId).IsRequired(false);
    builder.Property(n => n.EntityDefinitionId).IsRequired(false);
    builder.Property(n => n.TargetEntityId).IsRequired(false);
    builder.Property(n => n.WorkflowId).IsRequired(false);
    builder.Property(n => n.WorkflowTaskId).IsRequired(false);
    builder.Property(n => n.JarbassConflictAlertId).IsRequired(false);
    builder.Property(n => n.JarbassInsightId).IsRequired(false);
    builder.Property(n => n.SourceModule).IsRequired().HasMaxLength(60).HasDefaultValue("Jarbass");
    builder.Property(n => n.Category).IsRequired().HasMaxLength(60).HasDefaultValue("System");
    builder.Property(n => n.Severity).IsRequired().HasMaxLength(30).HasDefaultValue("Info");
    builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
    builder.Property(n => n.Message).IsRequired().HasMaxLength(2000);
    builder.Property(n => n.ActionLabel).IsRequired(false).HasMaxLength(100);
    builder.Property(n => n.ActionUrl).IsRequired(false).HasMaxLength(500);
    builder.Property(n => n.PayloadJson).IsRequired(false);
    builder.Property(n => n.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(n => n.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(n => n.CreatedAtUtc).IsRequired();
    builder.Property(n => n.ExpiresAtUtc).IsRequired(false);
    builder.Property(n => n.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(n => new { n.CorporationId, n.SourceModule, n.CreatedAtUtc });

    builder.HasOne(n => n.Corporation)
           .WithMany()
           .HasForeignKey(n => n.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(n => n.Workspace)
           .WithMany()
           .HasForeignKey(n => n.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.Application)
           .WithMany()
           .HasForeignKey(n => n.ApplicationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.CreatedByUser)
           .WithMany()
           .HasForeignKey(n => n.CreatedByUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.JarbassAgent)
           .WithMany()
           .HasForeignKey(n => n.JarbassAgentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.EntityDefinition)
           .WithMany()
           .HasForeignKey(n => n.EntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.Workflow)
           .WithMany()
           .HasForeignKey(n => n.WorkflowId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.WorkflowTask)
           .WithMany()
           .HasForeignKey(n => n.WorkflowTaskId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.JarbassConflictAlert)
           .WithMany()
           .HasForeignKey(n => n.JarbassConflictAlertId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(n => n.JarbassInsight)
           .WithMany()
           .HasForeignKey(n => n.JarbassInsightId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
