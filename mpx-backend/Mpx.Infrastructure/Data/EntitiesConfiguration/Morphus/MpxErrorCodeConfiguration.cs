using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxErrorCodeConfiguration : IEntityTypeConfiguration<MpxErrorCode>
{
  public void Configure(EntityTypeBuilder<MpxErrorCode> builder)
  {
    builder.ToTable("mpx_error_codes");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.Code).IsRequired().HasMaxLength(40);
    builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
    builder.Property(c => c.CorporationId).IsRequired();
    builder.Property(c => c.WorkspaceId).IsRequired(false);
    builder.Property(c => c.ApplicationId).IsRequired(false);
    builder.Property(c => c.FriendlyMessage).IsRequired().HasColumnType("text");
    builder.Property(c => c.Sla).IsRequired().HasDefaultValue(60);
    builder.Property(c => c.SeverityId).IsRequired();
    builder.Property(c => c.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(c => c.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(c => c.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(c => new { c.CorporationId, c.Code }).IsUnique();

    builder.HasOne(c => c.Corporation)
           .WithMany()
           .HasForeignKey(c => c.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.Workspace)
           .WithMany()
           .HasForeignKey(c => c.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.Application)
           .WithMany()
           .HasForeignKey(c => c.ApplicationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.Severity)
           .WithMany(s => s.ErrorCodes)
           .HasForeignKey(c => c.SeverityId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
