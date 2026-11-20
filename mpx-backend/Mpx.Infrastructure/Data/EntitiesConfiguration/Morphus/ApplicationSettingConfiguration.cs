using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ApplicationSettingConfiguration : IEntityTypeConfiguration<ApplicationSetting>
{
  public void Configure(EntityTypeBuilder<ApplicationSetting> builder)
  {
    builder.ToTable("mpx_application_settings");
    builder.HasKey(b => b.Id);
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.ApplicationId).IsRequired();
    builder.Property(b => b.SettingKey).IsRequired().HasMaxLength(80);
    builder.Property(b => b.Label).IsRequired().HasMaxLength(150);
    builder.Property(b => b.ValueType).IsRequired().HasMaxLength(40).HasDefaultValue("string");
    builder.Property(b => b.Value).IsRequired().HasMaxLength(500).HasDefaultValue(string.Empty);
    builder.Property(b => b.EndpointUrl).IsRequired(false).HasMaxLength(300);
    builder.Property(b => b.RefreshPolicy).IsRequired().HasMaxLength(40).HasDefaultValue("manual");
    builder.Property(b => b.IsLockedSystem).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Order).IsRequired().HasDefaultValue(0);
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.HasIndex(b => b.Key).IsUnique();
    builder.HasIndex(b => new { b.ApplicationId, b.SettingKey }).IsUnique();
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Description).IsRequired(false).HasMaxLength(120);

    builder.HasOne(b => b.Corporation)
           .WithMany(c => c.ApplicationSettings)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.Application)
           .WithMany(a => a.ApplicationSettings)
           .HasForeignKey(b => b.ApplicationId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}

