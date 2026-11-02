using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class UserClaimConfiguration : IEntityTypeConfiguration<UserClaim>
{
  public void Configure(EntityTypeBuilder<UserClaim> builder)
  {
    builder.HasKey(uc => new { uc.UserId, uc.ClaimId });

    builder.Property(uc => uc.UserId).IsRequired();
    builder.Property(uc => uc.ClaimId).IsRequired();
    builder.Property(uc => uc.CorporationId).IsRequired();
    builder.Property(uc => uc.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(uc => uc.System).IsRequired().HasDefaultValue(false);

    builder.HasOne(uc => uc.Corporation)
           .WithMany(b => b.UserClaims)
           .HasForeignKey(uc => uc.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(uc => uc.User)
           .WithMany(u => u.UserClaims)
           .HasForeignKey(uc => uc.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(uc => uc.Claim)
           .WithMany(c => c.UserClaims)
           .HasForeignKey(uc => uc.ClaimId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}

