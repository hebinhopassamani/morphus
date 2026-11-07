using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ApplicationSubModuleConfiguration : IEntityTypeConfiguration<ApplicationSubModule>
{
  public void Configure(EntityTypeBuilder<ApplicationSubModule> builder)
  {
    builder.ToTable("mpx_application_sub_modules");
    builder.HasKey(b => b.Id);
    builder.Property(b => b.Name).IsRequired().HasMaxLength(20);
    builder.Property(b => b.Label).IsRequired().HasMaxLength(20);
    builder.Property(b => b.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(b => b.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(b => b.Order).IsRequired().HasDefaultValue(0);
    builder.Property(b => b.RoutePattern).IsRequired(false).HasMaxLength(150);
    builder.Property(b => b.Default).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.HtmlContent).IsRequired(false).HasColumnType("text");
    builder.Property(b => b.CssContent).IsRequired(false).HasColumnType("text");
    builder.Property(b => b.JsContent).IsRequired(false).HasColumnType("text");
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.HasIndex(b => b.Key).IsUnique();
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.ApplicationModuleId).IsRequired();
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(b => b.ApplicationModule)
           .WithMany(m => m.ApplicationSubModules)
           .HasForeignKey(b => b.ApplicationModuleId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.Corporation)
           .WithMany(c => c.ApplicationSubModules)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
