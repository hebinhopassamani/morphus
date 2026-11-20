using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbPermissionLevelConfiguration : IEntityTypeConfiguration<JrbPermissionLevel>
{
  public void Configure(EntityTypeBuilder<JrbPermissionLevel> builder)
  {
    builder.ToTable("jrb_permission_levels");
    builder.HasKey(p => p.Id);

    builder.Property(p => p.CorporationId).IsRequired(false);
    builder.Property(p => p.Code).IsRequired().HasConversion<short>().HasDefaultValue(JarbassPermissionLevelEnum.ReadOnly);
    builder.Property(p => p.Label).IsRequired().HasMaxLength(120);
    builder.Property(p => p.AllowRead).IsRequired().HasDefaultValue(true);
    builder.Property(p => p.AllowWrite).IsRequired().HasDefaultValue(false);
    builder.Property(p => p.AllowSecurityChange).IsRequired().HasDefaultValue(false);
    builder.Property(p => p.Icon).IsRequired(false).HasMaxLength(80);
    builder.Property(p => p.Color).IsRequired(false).HasMaxLength(40);
    builder.Property(p => p.Order).IsRequired().HasDefaultValue(0);
    builder.Property(p => p.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(p => new { p.CorporationId, p.Code }).IsUnique();

    builder.HasOne(p => p.Corporation)
           .WithMany()
           .HasForeignKey(p => p.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
