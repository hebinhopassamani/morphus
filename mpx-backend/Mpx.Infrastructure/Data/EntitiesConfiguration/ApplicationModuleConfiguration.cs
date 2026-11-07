using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ApplicationModuleConfiguration : IEntityTypeConfiguration<ApplicationModule>
{
  public void Configure(EntityTypeBuilder<ApplicationModule> builder)
  {
    builder.ToTable("mpx_application_modules");
    builder.HasKey(b => b.Id);
    builder.Property(b => b.Name).IsRequired().HasMaxLength(20);
    builder.Property(b => b.Label).IsRequired().HasMaxLength(20);
    builder.Property(b => b.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(b => b.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(b => b.Order).IsRequired().HasDefaultValue(0);
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.HasIndex(b => b.Key).IsUnique();
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.ApplicationId).IsRequired();
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(b => b.Application)
           .WithMany(a => a.ApplicationModules)
           .HasForeignKey(b => b.ApplicationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.Corporation)
           .WithMany(c => c.ApplicationModules)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
