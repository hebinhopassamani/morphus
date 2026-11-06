using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
  public void Configure(EntityTypeBuilder<Role> builder)
  {
    builder.ToTable("sec_roles");
    builder.HasKey(r => r.Id);

    builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
    builder.Property(r => r.Key).IsRequired().HasMaxLength(100);
    builder.Property(r => r.System).IsRequired().HasDefaultValue(false);
    builder.Property(r => r.CorporationId).IsRequired();
    builder.Property(r => r.ModuleId).IsRequired();
    builder.Property(r => r.SubModuleId).IsRequired();
    builder.Property(r => r.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(r => r.Corporation)
           .WithMany(b => b.Roles)
           .HasForeignKey(r => r.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

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

