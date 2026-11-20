using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfStationConfiguration : IEntityTypeConfiguration<WkfStation>
{
  public void Configure(EntityTypeBuilder<WkfStation> builder)
  {
    builder.ToTable("wkf_stations");
    builder.HasKey(s => s.Id);

    builder.Property(s => s.Name).IsRequired().HasMaxLength(120);
    builder.Property(s => s.Code).IsRequired().HasMaxLength(80);
    builder.Property(s => s.CorporationId).IsRequired();
    builder.Property(s => s.StationTypeId).IsRequired(false);
    builder.Property(s => s.HasLayout).IsRequired().HasDefaultValue(false);
    builder.Property(s => s.DefaultLayoutHtml).IsRequired(false).HasColumnType("text");
    builder.Property(s => s.ProcessHandlerKey).IsRequired(false).HasMaxLength(120);
    builder.Property(s => s.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(s => s.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(s => s.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(s => new { s.CorporationId, s.Code }).IsUnique();

    builder.HasOne(s => s.StationType)
           .WithMany(t => t.Stations)
           .HasForeignKey(s => s.StationTypeId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(s => s.Corporation)
           .WithMany()
           .HasForeignKey(s => s.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
