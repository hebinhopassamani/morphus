using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbEncryptionStateConfiguration : IEntityTypeConfiguration<JrbEncryptionState>
{
  public void Configure(EntityTypeBuilder<JrbEncryptionState> builder)
  {
    builder.ToTable("jrb_encryption_states");
    builder.HasKey(e => e.Id);

    builder.Property(e => e.CorporationId).IsRequired(false);
    builder.Property(e => e.Code).IsRequired().HasConversion<short>().HasDefaultValue(JarbassEncryptionStateEnum.EncryptedAtRest);
    builder.Property(e => e.Label).IsRequired().HasMaxLength(120);
    builder.Property(e => e.IsEncrypted).IsRequired().HasDefaultValue(true);
    builder.Property(e => e.IsHeldInHand).IsRequired().HasDefaultValue(false);
    builder.Property(e => e.IsTamperLocked).IsRequired().HasDefaultValue(false);
    builder.Property(e => e.Icon).IsRequired(false).HasMaxLength(80);
    builder.Property(e => e.Color).IsRequired(false).HasMaxLength(40);
    builder.Property(e => e.Order).IsRequired().HasDefaultValue(0);
    builder.Property(e => e.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(e => new { e.CorporationId, e.Code }).IsUnique();

    builder.HasOne(e => e.Corporation)
           .WithMany()
           .HasForeignKey(e => e.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
