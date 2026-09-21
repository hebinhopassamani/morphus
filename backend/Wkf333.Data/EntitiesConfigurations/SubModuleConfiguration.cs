using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class SubModuleConfiguration : IEntityTypeConfiguration<SubModule>
{
  public void Configure(EntityTypeBuilder<SubModule> builder)
  {
    builder.ToTable("SubModule");
    builder.HasKey(sb => sb.Id);

    builder.Property(sb => sb.Name).IsRequired(true).HasMaxLength(100);
    builder.Property(sb => sb.Key).IsRequired(true).HasMaxLength(100);
    builder.Property(sb => sb.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(sb => sb.ModuleId).IsRequired(true).HasColumnType("uuid");
    builder.Property(sb => sb.Description).IsRequired(false).HasColumnType("Text");
    builder.Property(sb => sb.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasOne(sb => sb.Module)
           .WithMany(m => m.SubModules)
           .HasForeignKey(sb => sb.ModuleId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
