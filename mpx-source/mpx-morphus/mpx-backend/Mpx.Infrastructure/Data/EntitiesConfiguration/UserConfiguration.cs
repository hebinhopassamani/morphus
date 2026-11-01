using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
  public void Configure(EntityTypeBuilder<User> builder)
  {
    builder.HasKey(b => b.Id);
    builder.Property(b => b.Name).IsRequired().HasMaxLength(150);
    builder.Property(b => b.Email).IsRequired().HasMaxLength(150);
    builder.Property(b => b.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.EmailConfirmed).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.PhoneConfirmed).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.TermsConfirmed).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.UserStatusId).IsRequired();
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.PasswordHash).IsRequired(false).HasMaxLength(250);
    builder.Property(b => b.NickName).IsRequired(false).HasMaxLength(100);
    builder.Property(b => b.Picture).IsRequired(false).HasMaxLength(250);
    builder.Property(b => b.PhoneNumber).IsRequired(false).HasMaxLength(30);
    builder.Property(b => b.Website).IsRequired(false).HasMaxLength(150);
    builder.Property(b => b.Gender).IsRequired(false).HasMaxLength(10);
    builder.Property(b => b.Birthdate).IsRequired(false);
    builder.Property(b => b.RefreshToken).IsRequired(false).HasMaxLength(250);
    builder.Property(b => b.RefreshTokenExpiration).IsRequired(false);
    builder.Property(b => b.SecurityStamp).IsRequired(false).HasMaxLength(250);

    builder.HasIndex(b => b.Email).IsUnique();

    builder.HasOne(b => b.Corporation)
           .WithMany(b => b.Users)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.UserStatus)
           .WithMany(b => b.Users)
           .HasForeignKey(b => b.UserStatusId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
