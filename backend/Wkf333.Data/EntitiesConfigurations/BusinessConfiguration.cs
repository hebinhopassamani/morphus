using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class BusinessConfiguration : IEntityTypeConfiguration<Business>
{
  public void Configure(EntityTypeBuilder<Business> builder)
  {
    builder.ToTable("Business");
    builder.HasKey(b => b.Id);

    builder.Property(b => b.Name).IsRequired(true).HasMaxLength(100);
    builder.Property(b => b.FullName).IsRequired(false).HasMaxLength(100);
    builder.Property(b => b.Email).IsRequired(true).HasMaxLength(100);
    builder.Property(b => b.Key).IsRequired(true).HasMaxLength(50);
    builder.Property(b => b.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(b => b.BusinessId).IsRequired(false).HasColumnType("uuid");
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("Text");
    builder.Property(b => b.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

    builder.HasMany(b => b.Child)
           .WithOne(b => b.Parent)
           .HasForeignKey(b => b.BusinessId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
