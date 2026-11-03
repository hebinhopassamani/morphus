using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
  public void Configure(EntityTypeBuilder<ApplicationUser> builder)
  {
    builder.ToTable("application_users");

    builder.HasKey(au => new { au.ApplicationId, au.UserId });

    builder.Property(au => au.ApplicationId).IsRequired();
    builder.Property(au => au.UserId).IsRequired();
    builder.Property(au => au.CorporationId).IsRequired();
    builder.Property(au => au.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(au => au.System).IsRequired().HasDefaultValue(false);
    builder.Property(au => au.IsOwner).IsRequired().HasDefaultValue(false);

    builder.HasOne(au => au.Application)
           .WithMany(a => a.ApplicationUsers)
           .HasForeignKey(au => au.ApplicationId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(au => au.User)
           .WithMany(u => u.ApplicationUsers)
           .HasForeignKey(au => au.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(au => au.Corporation)
           .WithMany(c => c.ApplicationUsers)
           .HasForeignKey(au => au.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
