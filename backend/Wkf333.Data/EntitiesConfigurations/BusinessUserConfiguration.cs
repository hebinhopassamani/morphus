using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class BusinessUserConfiguration : IEntityTypeConfiguration<BusinessUser>
{
  public void Configure(EntityTypeBuilder<BusinessUser> builder)
  {
    builder.ToTable("BusinessUser");
    builder.HasKey(bu => new { bu.BusinessId, bu.UserId });

    builder.Property(bu => bu.BusinessId).IsRequired(true).HasColumnType("uuid");
    builder.Property(bu => bu.UserId).IsRequired(true).HasColumnType("uuid");
    builder.Property(bu => bu.Inactive).IsRequired(true).HasDefaultValue(false);
    builder.Property(bu => bu.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(bu => bu.IsOwner).IsRequired(true).HasDefaultValue(false);
    builder.Property(bu => bu.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasOne(bu => bu.Business)
           .WithMany(b => b.BusinessUsers)
           .HasForeignKey(bu => bu.BusinessId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(bu => bu.User)
           .WithMany(b => b.BusinessUsers)
           .HasForeignKey(bu => bu.UserId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
