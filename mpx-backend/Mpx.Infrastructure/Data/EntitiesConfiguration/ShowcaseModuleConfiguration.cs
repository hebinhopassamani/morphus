using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ShowcaseModuleConfiguration : IEntityTypeConfiguration<ShowcaseModule>
{
  public void Configure(EntityTypeBuilder<ShowcaseModule> builder)
  {
    builder.ToTable("mpx_modules");
    builder.HasKey(m => m.Id);

    builder.Property(m => m.CategoryId).IsRequired();
    builder.Property(m => m.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(m => m.Title).IsRequired().HasMaxLength(150);
    builder.Property(m => m.Description).IsRequired().HasMaxLength(120);
    builder.Property(m => m.ActionText).IsRequired().HasMaxLength(100);
    builder.Property(m => m.Order).IsRequired().HasDefaultValue(0);
    builder.Property(m => m.Key).IsRequired().HasMaxLength(100);
    builder.Property(m => m.System).IsRequired().HasDefaultValue(true);
    builder.Property(m => m.Inactive).IsRequired().HasDefaultValue(false);
  }
}
