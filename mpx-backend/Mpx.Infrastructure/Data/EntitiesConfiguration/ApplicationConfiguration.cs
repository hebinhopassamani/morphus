using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ApplicationConfiguration : IEntityTypeConfiguration<MorphusApplication>
{
  public void Configure(EntityTypeBuilder<MorphusApplication> builder)
  {
    builder.ToTable("mpx_applications");

    builder.HasKey(a => a.Id);
    builder.Property(a => a.Name).IsRequired().HasMaxLength(150);
    builder.Property(a => a.Prefix).IsRequired().HasMaxLength(3).HasDefaultValue(string.Empty);
    builder.Property(a => a.Key).IsRequired().HasMaxLength(100);
    builder.Property(a => a.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(a => a.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(a => a.LayoutKey).IsRequired().HasMaxLength(60).HasDefaultValue("sidebar-default");
    builder.Property(a => a.CustomLayoutHtml).IsRequired(false);
    builder.Property(a => a.Default).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.AvailableForTrial).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.System).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.CorporationId).IsRequired();
    builder.Property(a => a.Description).IsRequired(false).HasMaxLength(120);

    builder.HasIndex(a => new { a.CorporationId, a.Prefix }).IsUnique();

    builder.HasOne(a => a.Corporation)
           .WithMany(c => c.Applications)
           .HasForeignKey(a => a.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(a => a.Category)
           .WithMany(c => c.Applications)
           .HasForeignKey(a => a.CategoryId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(a => a.ApplicationStatus)
           .WithMany(s => s.Applications)
           .HasForeignKey(a => a.ApplicationStatusId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
