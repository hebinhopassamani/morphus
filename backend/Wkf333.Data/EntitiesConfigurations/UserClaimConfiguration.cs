using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class UserClaimConfiguration : IEntityTypeConfiguration<UserClaim>
{
  public void Configure(EntityTypeBuilder<UserClaim> builder)
  {
    builder.ToTable("UserClaim");
    builder.HasKey(uc => new { uc.UserId, uc.ClaimId });

    builder.Property(uc => uc.UserId).IsRequired(true).HasColumnType("uuid");
    builder.Property(uc => uc.ClaimId).IsRequired(true).HasColumnType("uuid");
    builder.Property(uc => uc.Inactive).IsRequired(true).HasDefaultValue(false);
    builder.Property(uc => uc.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(uc => uc.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasOne(uc => uc.User)
           .WithMany(b => b.UserClaims)
           .HasForeignKey(uc => uc.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(uc => uc.Claim)
           .WithMany(b => b.UserClaims)
           .HasForeignKey(uc => uc.ClaimId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
