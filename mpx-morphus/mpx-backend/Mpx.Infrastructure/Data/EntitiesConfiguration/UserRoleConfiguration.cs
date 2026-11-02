using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
  public void Configure(EntityTypeBuilder<UserRole> builder)
  {
    builder.HasKey(ur => new { ur.UserId, ur.RoleId });

    builder.Property(ur => ur.UserId).IsRequired();
    builder.Property(ur => ur.RoleId).IsRequired();
    builder.Property(ur => ur.CorporationId).IsRequired();
    builder.Property(ur => ur.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(ur => ur.System).IsRequired().HasDefaultValue(false);

    builder.HasOne(ur => ur.Corporation)
           .WithMany(b => b.UserRoles)
           .HasForeignKey(ur => ur.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(ur => ur.User)
           .WithMany(u => u.UserRoles)
           .HasForeignKey(ur => ur.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(ur => ur.Role)
           .WithMany(r => r.UserRoles)
           .HasForeignKey(ur => ur.RoleId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}

