using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
  public void Configure(EntityTypeBuilder<Role> builder)
  {
    builder.ToTable("Role");
    builder.HasKey(r => r.Id);

    builder.Property(r => r.Name).IsRequired(true).HasMaxLength(100);
    builder.Property(r => r.Key).IsRequired(true).HasMaxLength(100);
    builder.Property(r => r.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(r => r.BusinessId).IsRequired(true).HasColumnType("uuid");
    builder.Property(r => r.ModuleId).IsRequired(true).HasColumnType("uuid");
    builder.Property(r => r.SubModuleId).IsRequired(true).HasColumnType("uuid");
    builder.Property(r => r.Description).IsRequired(false).HasColumnType("Text");
    builder.Property(r => r.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasOne(r => r.Module)
           .WithMany(m => m.Roles)
           .HasForeignKey(r => r.ModuleId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(r => r.SubModule)
           .WithMany(s => s.Roles)
           .HasForeignKey(r => r.SubModuleId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
