using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxFileTypeConfiguration : IEntityTypeConfiguration<MpxFileType>
{
  public void Configure(EntityTypeBuilder<MpxFileType> builder)
  {
    builder.ToTable("mpx_file_types");
    builder.HasKey(f => f.Id);

    builder.Property(f => f.Name).IsRequired().HasMaxLength(120);
    builder.Property(f => f.Extension).IsRequired().HasMaxLength(20);
    builder.Property(f => f.MimeType).IsRequired().HasMaxLength(150);
    builder.Property(f => f.Category).IsRequired().HasMaxLength(60).HasDefaultValue("Document");
    builder.Property(f => f.MaxSizeInMb).IsRequired().HasDefaultValue(10);
    builder.Property(f => f.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(f => f.Description).IsRequired(false).HasColumnType("text");
    builder.Property(f => f.CorporationId).IsRequired();
    builder.Property(f => f.SecurityScopeId).IsRequired(false);
    builder.Property(f => f.SecurityLevelId).IsRequired(false);
    builder.Property(f => f.DefaultPermissionLevelId).IsRequired(false);
    builder.Property(f => f.DefaultRequiredClaimKey).IsRequired(false).HasMaxLength(120);
    builder.Property(f => f.DefaultLeaseMinutes).IsRequired().HasDefaultValue(60);

    builder.HasIndex(f => new { f.CorporationId, f.SecurityScopeId, f.SecurityLevelId });

    builder.HasOne(f => f.Corporation)
           .WithMany()
           .HasForeignKey(f => f.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.SecurityScope)
           .WithMany(s => s.FileTypes)
           .HasForeignKey(f => f.SecurityScopeId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.SecurityLevel)
           .WithMany(l => l.FileTypes)
           .HasForeignKey(f => f.SecurityLevelId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.DefaultPermissionLevel)
           .WithMany(p => p.FileTypes)
           .HasForeignKey(f => f.DefaultPermissionLevelId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
