using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class UserStatusConfiguration : IEntityTypeConfiguration<UserStatus>
{
  public void Configure(EntityTypeBuilder<UserStatus> builder)
  {
    builder.HasKey(b => b.Id);
    builder.Property(b => b.Name).IsRequired().HasMaxLength(150);
    builder.Property(b => b.Key).IsRequired().HasMaxLength(150);
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(b => b.Corporation)
           .WithMany(b => b.UserStatus)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasMany(b => b.Users)
           .WithOne(b => b.UserStatus)
           .HasForeignKey(b => b.UserStatusId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
