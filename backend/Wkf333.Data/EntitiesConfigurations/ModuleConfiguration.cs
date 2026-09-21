using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class ModuleConfiguration : IEntityTypeConfiguration<Module>
{
  public void Configure(EntityTypeBuilder<Module> builder)
  {
    builder.ToTable("Module");
    builder.HasKey(m => m.Id);

    builder.Property(m => m.Name).IsRequired(true).HasMaxLength(100);
    builder.Property(m => m.Key).IsRequired(true).HasMaxLength(100);
    builder.Property(m => m.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(m => m.BusinessId).IsRequired(true).HasColumnType("uuid");
    builder.Property(m => m.Description).IsRequired(false).HasColumnType("Text");
    builder.Property(m => m.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);
  }
}
