using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ModuleCategoryConfiguration : IEntityTypeConfiguration<ModuleCategory>
{
  public void Configure(EntityTypeBuilder<ModuleCategory> builder)
  {
    builder.ToTable("mpx_module_categories");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
    builder.Property(c => c.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(c => c.Order).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.Key).IsRequired().HasMaxLength(100);
    builder.Property(c => c.System).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.Inactive).IsRequired().HasDefaultValue(false);

    builder.HasMany(c => c.Modules)
           .WithOne(m => m.Category)
           .HasForeignKey(m => m.CategoryId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
