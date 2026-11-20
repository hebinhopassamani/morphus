using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTaskOwnerConfiguration : IEntityTypeConfiguration<WorkflowTaskOwner>
{
  public void Configure(EntityTypeBuilder<WorkflowTaskOwner> builder)
  {
    builder.ToTable("wkf_workflow_task_owners");
    builder.HasKey(o => o.Id);

    builder.Property(o => o.CorporationId).IsRequired();
    builder.Property(o => o.WorkflowTaskId).IsRequired();
    builder.Property(o => o.UserId).IsRequired();
    builder.Property(o => o.IsRapporteur).IsRequired().HasDefaultValue(false);
    builder.Property(o => o.WorkflowTypeConfigActionId).IsRequired(false);
    builder.Property(o => o.FollowedRapporteur).IsRequired(false);
    builder.Property(o => o.Opinion).IsRequired(false).HasColumnType("text");
    builder.Property(o => o.IpAddress).IsRequired(false).HasMaxLength(60);
    builder.Property(o => o.UserAgent).IsRequired(false).HasMaxLength(300);
    builder.Property(o => o.ClaimedAt).IsRequired();
    builder.Property(o => o.ReleasedAt).IsRequired(false);
    builder.Property(o => o.TransferredToUserId).IsRequired(false);
    builder.Property(o => o.ReleaseReason).IsRequired(false).HasColumnType("text");
    builder.Property(o => o.CompletedAt).IsRequired(false);

    builder.HasOne(o => o.Corporation)
           .WithMany()
           .HasForeignKey(o => o.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(o => o.WorkflowTask)
           .WithMany(t => t.Owners)
           .HasForeignKey(o => o.WorkflowTaskId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(o => o.User)
           .WithMany()
           .HasForeignKey(o => o.UserId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(o => o.TransferredToUser)
           .WithMany()
           .HasForeignKey(o => o.TransferredToUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(o => o.WorkflowTypeConfigAction)
           .WithMany()
           .HasForeignKey(o => o.WorkflowTypeConfigActionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
