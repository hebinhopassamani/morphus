using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
  public void Configure(EntityTypeBuilder<User> builder)
  {
    builder.ToTable("User");
    builder.HasKey(u => u.Id);

    builder.Property(u => u.Name).IsRequired(true).HasMaxLength(100);
    builder.Property(u => u.Email).IsRequired(true).HasMaxLength(100);
    builder.Property(u => u.Inactive).IsRequired(true).HasDefaultValue(false);
    builder.Property(u => u.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(u => u.TermsConfirmed).IsRequired(true).HasDefaultValue(false);
    builder.Property(u => u.EmailConfirmed).IsRequired(true).HasDefaultValue(false);
    builder.Property(u => u.PhoneConfirmed).IsRequired(true).HasDefaultValue(false);
    builder.Property(u => u.UserStatusId).IsRequired(true).HasColumnType("uuid");
    builder.Property(u => u.PasswordHash).IsRequired(false).HasMaxLength(200);
    builder.Property(u => u.NickName).IsRequired(false).HasMaxLength(50);
    builder.Property(u => u.PhoneNumber).IsRequired(false).HasMaxLength(20);
    builder.Property(u => u.Picture).IsRequired(false).HasMaxLength(200);
    builder.Property(u => u.Website).IsRequired(false).HasMaxLength(100);
    builder.Property(u => u.Gender).IsRequired(false).HasMaxLength(1);
    builder.Property(u => u.RefreshToken).IsRequired(false).HasMaxLength(200);
    builder.Property(u => u.RefreshTokenExpiration).IsRequired(false);
    builder.Property(u => u.Birthdate).IsRequired(false);
    builder.Property(u => u.SecurityStamp).IsRequired(false).HasMaxLength(200);
    builder.Property(u => u.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasOne(u => u.UserStatus)
           .WithMany(us => us.Users)
           .HasForeignKey(u => u.UserStatusId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
