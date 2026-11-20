using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxErrorConfiguration : IEntityTypeConfiguration<MpxError>
{
  public void Configure(EntityTypeBuilder<MpxError> builder)
  {
    builder.ToTable("mpx_errors");
    builder.HasKey(e => e.Id);

    builder.Property(e => e.ErrorCodeId).IsRequired();
    builder.Property(e => e.ErrorStateId).IsRequired();
    builder.Property(e => e.CorporationId).IsRequired();
    builder.Property(e => e.WorkspaceId).IsRequired(false);
    builder.Property(e => e.ApplicationId).IsRequired(false);
    builder.Property(e => e.WorkflowTypeId).IsRequired(false);
    builder.Property(e => e.WorkflowId).IsRequired(false);
    builder.Property(e => e.WorkflowTaskId).IsRequired(false);
    builder.Property(e => e.OriginConfigId).IsRequired(false);
    builder.Property(e => e.UserId).IsRequired(false);
    builder.Property(e => e.Message).IsRequired().HasColumnType("text");
    builder.Property(e => e.UserMessage).IsRequired().HasColumnType("text");
    builder.Property(e => e.Method).IsRequired().HasMaxLength(250);
    builder.Property(e => e.UserSnapshot).IsRequired(false).HasColumnType("text");
    builder.Property(e => e.ContextSnapshot).IsRequired(false).HasColumnType("text");
    builder.Property(e => e.ResolvedByUserId).IsRequired(false);
    builder.Property(e => e.ResolvedAt).IsRequired(false);
    builder.Property(e => e.ResolutionNotes).IsRequired(false).HasColumnType("text");

    builder.HasIndex(e => new { e.CorporationId, e.ErrorStateId, e.CreatedAt });
    builder.HasIndex(e => new { e.WorkflowId, e.OriginConfigId });

    builder.HasOne(e => e.ErrorCode)
           .WithMany(c => c.Errors)
           .HasForeignKey(e => e.ErrorCodeId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.ErrorState)
           .WithMany(s => s.Errors)
           .HasForeignKey(e => e.ErrorStateId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.Corporation)
           .WithMany()
           .HasForeignKey(e => e.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.Workspace)
           .WithMany()
           .HasForeignKey(e => e.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.Application)
           .WithMany()
           .HasForeignKey(e => e.ApplicationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.WorkflowType)
           .WithMany()
           .HasForeignKey(e => e.WorkflowTypeId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(e => e.Workflow)
           .WithMany()
           .HasForeignKey(e => e.WorkflowId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(e => e.WorkflowTask)
           .WithMany()
           .HasForeignKey(e => e.WorkflowTaskId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(e => e.OriginConfig)
           .WithMany()
           .HasForeignKey(e => e.OriginConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(e => e.User)
           .WithMany()
           .HasForeignKey(e => e.UserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(e => e.ResolvedByUser)
           .WithMany()
           .HasForeignKey(e => e.ResolvedByUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
