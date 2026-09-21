using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
  public void Configure(EntityTypeBuilder<UserRole> builder)
  {
    builder.ToTable("UserRole");
    builder.HasKey(ur => new { ur.UserId, ur.RoleId });

    builder.Property(ur => ur.UserId).IsRequired(true).HasColumnType("uuid");
    builder.Property(ur => ur.RoleId).IsRequired(true).HasColumnType("uuid");
    builder.Property(ur => ur.Inactive).IsRequired(true).HasDefaultValue(false);
    builder.Property(ur => ur.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(ur => ur.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasOne(ur => ur.User)
           .WithMany(b => b.UserRoles)
           .HasForeignKey(ur => ur.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(ur => ur.Role)
           .WithMany(b => b.UserRoles)
           .HasForeignKey(ur => ur.RoleId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
