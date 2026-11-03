using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ApplicationStatusConfiguration : IEntityTypeConfiguration<ApplicationStatus>
{
  public void Configure(EntityTypeBuilder<ApplicationStatus> builder)
  {
    builder.ToTable("application_statuses");

    builder.HasKey(b => b.Id);
    builder.Property(b => b.Name).IsRequired().HasMaxLength(150);
    builder.Property(b => b.Label).IsRequired().HasMaxLength(100).HasDefaultValue(string.Empty);
    builder.Property(b => b.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(b => b.Corporation)
           .WithMany(b => b.ApplicationStatuses)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasMany(b => b.Applications)
           .WithOne(b => b.ApplicationStatus)
           .HasForeignKey(b => b.ApplicationStatusId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
