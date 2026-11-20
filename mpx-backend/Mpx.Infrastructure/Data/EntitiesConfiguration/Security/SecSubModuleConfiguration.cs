using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class SecSubModuleConfiguration : IEntityTypeConfiguration<SecSubModule>
{
  public void Configure(EntityTypeBuilder<SecSubModule> builder)
  {
    builder.ToTable("sec_sub_modules");
    builder.HasKey(b => b.Id);
    builder.Property(b => b.Name).IsRequired().HasMaxLength(150);
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.ModuleId).IsRequired();
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(b => b.Corporation)
           .WithMany(b => b.SubModules)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.Module)
           .WithMany(b => b.SubModules)
           .HasForeignKey(b => b.ModuleId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}

