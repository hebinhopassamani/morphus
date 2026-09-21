using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class RoleClaimConfiguration : IEntityTypeConfiguration<RoleClaim>
{
  public void Configure(EntityTypeBuilder<RoleClaim> builder)
  {
    builder.ToTable("RoleClaim");
    builder.HasKey(rc => new { rc.RoleId, rc.ClaimId });

    builder.Property(rc => rc.RoleId).IsRequired(true).HasColumnType("uuid");
    builder.Property(rc => rc.ClaimId).IsRequired(true).HasColumnType("uuid");
    builder.Property(rc => rc.Inactive).IsRequired(true).HasDefaultValue(false);
    builder.Property(rc => rc.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(rc => rc.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasOne(rc => rc.Role)
           .WithMany(b => b.RoleClaims)
           .HasForeignKey(rc => rc.RoleId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(rc => rc.Claim)
           .WithMany(b => b.RoleClaims)
           .HasForeignKey(rc => rc.ClaimId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
