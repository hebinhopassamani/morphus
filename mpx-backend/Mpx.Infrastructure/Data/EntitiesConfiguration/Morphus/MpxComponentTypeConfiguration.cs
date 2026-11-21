using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxComponentTypeConfiguration : IEntityTypeConfiguration<MpxComponentType>
{
  public void Configure(EntityTypeBuilder<MpxComponentType> builder)
  {
    builder.ToTable("mpx_component_types");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.CorporationId).IsRequired(false);
    builder.Property(c => c.Code).IsRequired().HasConversion<short>().HasDefaultValue(MpxComponentTypeEnum.MpxButton);
    builder.Property(c => c.TagName).IsRequired().HasMaxLength(80);
    builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
    builder.Property(c => c.Label).IsRequired().HasMaxLength(150);
    builder.Property(c => c.IsContainerWrapper).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.SupportsWorkflowAction).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.SupportsReflectedField).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.DefaultParametersJson).IsRequired().HasColumnType("text");
    builder.Property(c => c.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(c => c.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(c => c.Order).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(c => new { c.CorporationId, c.Code }).IsUnique();

    builder.HasOne(c => c.Corporation)
           .WithMany()
           .HasForeignKey(c => c.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
