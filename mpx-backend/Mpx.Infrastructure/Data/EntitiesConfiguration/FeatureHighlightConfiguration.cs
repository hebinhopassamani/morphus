using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class FeatureHighlightConfiguration : IEntityTypeConfiguration<FeatureHighlight>
{
  public void Configure(EntityTypeBuilder<FeatureHighlight> builder)
  {
    builder.ToTable("mpx_feature_highlights");
    builder.HasKey(h => h.Id);

    builder.Property(h => h.FeatureId).IsRequired();
    builder.Property(h => h.Title).IsRequired().HasMaxLength(150);
    builder.Property(h => h.TitleIcon).IsRequired(false).HasMaxLength(100);
    builder.Property(h => h.Highlight).IsRequired().HasMaxLength(80);
    builder.Property(h => h.HighlightIcon).IsRequired(false).HasMaxLength(100);
    builder.Property(h => h.Order).IsRequired().HasDefaultValue(0);
    builder.Property(h => h.Key).IsRequired().HasMaxLength(100);
    builder.Property(h => h.System).IsRequired().HasDefaultValue(true);
    builder.Property(h => h.Inactive).IsRequired().HasDefaultValue(false);
  }
}
