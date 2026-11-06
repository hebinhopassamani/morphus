using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class FeatureConfiguration : IEntityTypeConfiguration<Feature>
{
  public void Configure(EntityTypeBuilder<Feature> builder)
  {
    builder.ToTable("mpx_features");
    builder.HasKey(f => f.Id);

    builder.Property(f => f.Title).IsRequired().HasMaxLength(200);
    builder.Property(f => f.HighlightPhrase).IsRequired().HasMaxLength(200);
    builder.Property(f => f.Description).IsRequired().HasColumnType("text");
    builder.Property(f => f.Order).IsRequired().HasDefaultValue(0);
    builder.Property(f => f.Key).IsRequired().HasMaxLength(100);
    builder.Property(f => f.System).IsRequired().HasDefaultValue(true);
    builder.Property(f => f.Inactive).IsRequired().HasDefaultValue(false);

    builder.HasMany(f => f.Highlights)
           .WithOne(h => h.Feature)
           .HasForeignKey(h => h.FeatureId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
