using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbSecurityLevelConfiguration : IEntityTypeConfiguration<JrbSecurityLevel>
{
  public void Configure(EntityTypeBuilder<JrbSecurityLevel> builder)
  {
    builder.ToTable("jrb_security_levels");
    builder.HasKey(l => l.Id);

    builder.Property(l => l.CorporationId).IsRequired(false);
    builder.Property(l => l.Code).IsRequired().HasConversion<short>().HasDefaultValue(JarbassSecurityLevelEnum.Unrestricted);
    builder.Property(l => l.Label).IsRequired().HasMaxLength(120);
    builder.Property(l => l.JarbassShouldIgnore).IsRequired().HasDefaultValue(false);
    builder.Property(l => l.RequiresEncryptionAtRest).IsRequired().HasDefaultValue(false);
    builder.Property(l => l.RequiresOnlineValidation).IsRequired().HasDefaultValue(false);
    builder.Property(l => l.Icon).IsRequired(false).HasMaxLength(80);
    builder.Property(l => l.Color).IsRequired(false).HasMaxLength(40);
    builder.Property(l => l.Order).IsRequired().HasDefaultValue(0);
    builder.Property(l => l.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(l => new { l.CorporationId, l.Code }).IsUnique();
    builder.HasIndex(l => new { l.Code, l.JarbassShouldIgnore, l.RequiresOnlineValidation });

    builder.HasOne(l => l.Corporation)
           .WithMany()
           .HasForeignKey(l => l.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
