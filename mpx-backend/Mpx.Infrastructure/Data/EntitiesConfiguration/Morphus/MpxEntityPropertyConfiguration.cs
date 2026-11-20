using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxEntityPropertyConfiguration : IEntityTypeConfiguration<MpxEntityProperty>
{
  public void Configure(EntityTypeBuilder<MpxEntityProperty> builder)
  {
    builder.ToTable("mpx_entity_properties");
    builder.HasKey(p => p.Id);

    builder.Property(p => p.CorporationId).IsRequired(false);
    builder.Property(p => p.EntityDefinitionId).IsRequired();
    builder.Property(p => p.Name).IsRequired().HasMaxLength(120);
    builder.Property(p => p.ColumnName).IsRequired(false).HasMaxLength(120);
    builder.Property(p => p.Label).IsRequired().HasMaxLength(150);
    builder.Property(p => p.DataType).IsRequired().HasMaxLength(40).HasDefaultValue("Text");
    builder.Property(p => p.DefaultControlType).IsRequired().HasMaxLength(40).HasDefaultValue("Input");
    builder.Property(p => p.TargetEntityDefinitionId).IsRequired(false);
    builder.Property(p => p.ForeignKeyPropertyName).IsRequired(false).HasMaxLength(120);
    builder.Property(p => p.IsPrimaryKey).IsRequired().HasDefaultValue(false);
    builder.Property(p => p.IsForeignKey).IsRequired().HasDefaultValue(false);
    builder.Property(p => p.IsRequired).IsRequired().HasDefaultValue(false);
    builder.Property(p => p.MinLength).IsRequired(false);
    builder.Property(p => p.MaxLength).IsRequired(false);
    builder.Property(p => p.MinValue).IsRequired(false).HasColumnType("numeric(18,4)");
    builder.Property(p => p.MaxValue).IsRequired(false).HasColumnType("numeric(18,4)");
    builder.Property(p => p.DefaultMask).IsRequired(false).HasMaxLength(100);
    builder.Property(p => p.RegexPattern).IsRequired(false).HasMaxLength(300);
    builder.Property(p => p.Order).IsRequired().HasDefaultValue(0);
    builder.Property(p => p.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(p => new { p.EntityDefinitionId, p.Name }).IsUnique();

    builder.HasOne(p => p.Corporation)
           .WithMany()
           .HasForeignKey(p => p.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(p => p.EntityDefinition)
           .WithMany(e => e.Properties)
           .HasForeignKey(p => p.EntityDefinitionId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.TargetEntityDefinition)
           .WithMany(e => e.TargetedByProperties)
           .HasForeignKey(p => p.TargetEntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
