using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class CorporationUserConfiguration : IEntityTypeConfiguration<CorporationUser>
{
  public void Configure(EntityTypeBuilder<CorporationUser> builder)
  {
    builder.HasKey(bu => new { bu.CorporationId, bu.UserId });

    builder.Property(bu => bu.CorporationId).IsRequired();
    builder.Property(bu => bu.UserId).IsRequired();
    builder.Property(bu => bu.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(bu => bu.System).IsRequired().HasDefaultValue(false);
    builder.Property(bu => bu.IsOwner).IsRequired().HasDefaultValue(false);

    builder.HasOne(bu => bu.Corporation)
           .WithMany(b => b.CorporationUsers)
           .HasForeignKey(bu => bu.CorporationId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(bu => bu.User)
           .WithMany(u => u.CorporationUsers)
           .HasForeignKey(bu => bu.UserId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}

