using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class UserStatusConfiguration : IEntityTypeConfiguration<UserStatus>
{
  public void Configure(EntityTypeBuilder<UserStatus> builder)
  {
    builder.ToTable("UserStatus");
    builder.HasKey(us => us.Id);

    builder.Property(us => us.Name).IsRequired(true).HasMaxLength(100);
    builder.Property(us => us.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(us => us.BusinessId).IsRequired(true).HasColumnType("uuid");
    builder.Property(us => us.Description).IsRequired(false).HasColumnType("Text");
    builder.Property(us => us.ConcurrencyStamp).IsRequired(false).HasMaxLength(300);
  }
}
