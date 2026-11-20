using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfTypeConfigFieldConfiguration : IEntityTypeConfiguration<WkfTypeConfigField>
{
  public void Configure(EntityTypeBuilder<WkfTypeConfigField> builder)
  {
    builder.ToTable("wkf_workflow_type_config_fields");
    builder.HasKey(f => f.Id);

    builder.Property(f => f.CorporationId).IsRequired();
    builder.Property(f => f.WorkflowTypeConfigId).IsRequired();
    builder.Property(f => f.WorkflowTypeContextId).IsRequired(false);
    builder.Property(f => f.EntityDefinitionId).IsRequired(false);
    builder.Property(f => f.EntityPropertyId).IsRequired(false);
    builder.Property(f => f.TargetEntityDefinitionId).IsRequired(false);
    builder.Property(f => f.IsEntityProperty).IsRequired().HasDefaultValue(true);
    builder.Property(f => f.EntityName).IsRequired(false).HasMaxLength(120);
    builder.Property(f => f.EntityAlias).IsRequired(false).HasMaxLength(120);
    builder.Property(f => f.IsCollection).IsRequired().HasDefaultValue(false);
    builder.Property(f => f.PropertyName).IsRequired(false).HasMaxLength(150);
    builder.Property(f => f.PropertyPath).IsRequired(false).HasMaxLength(300);
    builder.Property(f => f.Label).IsRequired().HasMaxLength(150);
    builder.Property(f => f.Placeholder).IsRequired(false).HasMaxLength(200);
    builder.Property(f => f.DataType).IsRequired().HasMaxLength(40).HasDefaultValue("text");
    builder.Property(f => f.ControlType).IsRequired().HasMaxLength(40).HasDefaultValue("Input");
    builder.Property(f => f.OptionsJson).IsRequired(false).HasColumnType("text");
    builder.Property(f => f.Mask).IsRequired(false).HasMaxLength(100);
    builder.Property(f => f.DefaultValue).IsRequired(false).HasColumnType("text");
    builder.Property(f => f.IsVisible).IsRequired().HasDefaultValue(true);
    builder.Property(f => f.IsEditable).IsRequired().HasDefaultValue(false);
    builder.Property(f => f.IsRequired).IsRequired().HasDefaultValue(false);
    builder.Property(f => f.MinLength).IsRequired(false);
    builder.Property(f => f.MaxLength).IsRequired(false);
    builder.Property(f => f.MinValue).IsRequired(false).HasColumnType("numeric(18,4)");
    builder.Property(f => f.MaxValue).IsRequired(false).HasColumnType("numeric(18,4)");
    builder.Property(f => f.RegexPattern).IsRequired(false).HasMaxLength(300);
    builder.Property(f => f.GridSpan).IsRequired().HasDefaultValue(12);
    builder.Property(f => f.Order).IsRequired().HasDefaultValue(0);
    builder.Property(f => f.CustomCss).IsRequired(false).HasColumnType("text");
    builder.Property(f => f.HelpText).IsRequired(false).HasColumnType("text");

    builder.HasOne(f => f.Corporation)
           .WithMany()
           .HasForeignKey(f => f.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.WorkflowTypeConfig)
           .WithMany(c => c.Fields)
           .HasForeignKey(f => f.WorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(f => f.WorkflowTypeContext)
           .WithMany(ctx => ctx.Fields)
           .HasForeignKey(f => f.WorkflowTypeContextId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(f => f.EntityDefinition)
           .WithMany()
           .HasForeignKey(f => f.EntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(f => f.EntityProperty)
           .WithMany()
           .HasForeignKey(f => f.EntityPropertyId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(f => f.TargetEntityDefinition)
           .WithMany()
           .HasForeignKey(f => f.TargetEntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
