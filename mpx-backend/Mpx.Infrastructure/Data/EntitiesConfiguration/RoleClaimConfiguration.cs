using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class RoleClaimConfiguration : IEntityTypeConfiguration<RoleClaim>
{
  public void Configure(EntityTypeBuilder<RoleClaim> builder)
  {
    builder.ToTable("sec_role_claims");
    builder.HasKey(rc => new { rc.RoleId, rc.ClaimId });

    builder.Property(rc => rc.RoleId).IsRequired();
    builder.Property(rc => rc.ClaimId).IsRequired();
    builder.Property(rc => rc.CorporationId).IsRequired();
    builder.Property(rc => rc.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(rc => rc.System).IsRequired().HasDefaultValue(false);

    builder.HasOne(rc => rc.Corporation)
           .WithMany(b => b.RoleClaims)
           .HasForeignKey(rc => rc.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(rc => rc.Role)
           .WithMany(r => r.RoleClaims)
           .HasForeignKey(rc => rc.RoleId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(rc => rc.Claim)
           .WithMany(c => c.RoleClaims)
           .HasForeignKey(rc => rc.ClaimId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}

