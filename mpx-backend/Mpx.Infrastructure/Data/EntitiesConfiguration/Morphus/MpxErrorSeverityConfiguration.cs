using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxErrorSeverityConfiguration : IEntityTypeConfiguration<MpxErrorSeverity>
{
  public void Configure(EntityTypeBuilder<MpxErrorSeverity> builder)
  {
    builder.ToTable("mpx_error_severities");
    builder.HasKey(s => s.Id);

    builder.Property(s => s.CorporationId).IsRequired(false);
    builder.Property(s => s.Code).IsRequired().HasConversion<short>().HasDefaultValue(MpxErrorSeverityEnum.Low);
    builder.Property(s => s.Label).IsRequired().HasMaxLength(150);
    builder.Property(s => s.InvolvesEntireWorkspace).IsRequired().HasDefaultValue(false);
    builder.Property(s => s.InvolvesEntireCorporation).IsRequired().HasDefaultValue(false);
    builder.Property(s => s.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(s => s.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(s => s.Order).IsRequired().HasDefaultValue(0);
    builder.Property(s => s.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(s => new { s.CorporationId, s.Code }).IsUnique();

    builder.HasOne(s => s.Corporation)
           .WithMany()
           .HasForeignKey(s => s.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
