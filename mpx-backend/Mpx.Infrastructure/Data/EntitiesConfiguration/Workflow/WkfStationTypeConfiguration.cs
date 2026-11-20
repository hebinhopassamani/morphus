using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfStationTypeConfiguration : IEntityTypeConfiguration<WkfStationType>
{
  public void Configure(EntityTypeBuilder<WkfStationType> builder)
  {
    builder.ToTable("wkf_station_types");
    builder.HasKey(t => t.Id);

    builder.Property(t => t.CorporationId).IsRequired(false);
    builder.Property(t => t.Code).IsRequired().HasConversion<short>().HasDefaultValue(WkfStationTypeEnum.Screen);
    builder.Property(t => t.Name).IsRequired().HasMaxLength(120);
    builder.Property(t => t.Label).IsRequired().HasMaxLength(150);
    builder.Property(t => t.IsInputPort).IsRequired().HasDefaultValue(false);
    builder.Property(t => t.IsOutputPort).IsRequired().HasDefaultValue(false);
    builder.Property(t => t.IsIsolatedErrorCatcher).IsRequired().HasDefaultValue(false);
    builder.Property(t => t.HasLayout).IsRequired().HasDefaultValue(false);
    builder.Property(t => t.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(t => t.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(t => t.Order).IsRequired().HasDefaultValue(0);
    builder.Property(t => t.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(t => new { t.CorporationId, t.Code }).IsUnique();

    builder.HasOne(t => t.Corporation)
           .WithMany()
           .HasForeignKey(t => t.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
