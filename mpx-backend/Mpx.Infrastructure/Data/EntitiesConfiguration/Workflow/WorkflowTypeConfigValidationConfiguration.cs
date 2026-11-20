using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTypeConfigValidationConfiguration : IEntityTypeConfiguration<WorkflowTypeConfigValidation>
{
  public void Configure(EntityTypeBuilder<WorkflowTypeConfigValidation> builder)
  {
    builder.ToTable("wkf_workflow_type_config_validations");
    builder.HasKey(v => v.Id);

    builder.Property(v => v.CorporationId).IsRequired();
    builder.Property(v => v.WorkflowTypeConfigId).IsRequired();
    builder.Property(v => v.WorkflowTypeConfigActionId).IsRequired(false);
    builder.Property(v => v.ValidationType).IsRequired().HasMaxLength(40).HasDefaultValue("FilterRule");
    builder.Property(v => v.PresetValidatorKey).IsRequired(false).HasMaxLength(100);
    builder.Property(v => v.EntityName).IsRequired(false).HasMaxLength(120);
    builder.Property(v => v.EntityAlias).IsRequired(false).HasMaxLength(120);
    builder.Property(v => v.OpenParenthesis).IsRequired().HasDefaultValue(false);
    builder.Property(v => v.PropertyName).IsRequired().HasMaxLength(150);
    builder.Property(v => v.DataType).IsRequired().HasMaxLength(40).HasDefaultValue("text");
    builder.Property(v => v.Operator).IsRequired(false).HasMaxLength(40);
    builder.Property(v => v.Value).IsRequired(false).HasColumnType("text");
    builder.Property(v => v.CloseParenthesis).IsRequired().HasDefaultValue(false);
    builder.Property(v => v.AndOr).IsRequired(false).HasMaxLength(10);
    builder.Property(v => v.WhereClause).IsRequired(false).HasColumnType("text");
    builder.Property(v => v.RegexPattern).IsRequired(false).HasMaxLength(300);
    builder.Property(v => v.Severity).IsRequired().HasMaxLength(20).HasDefaultValue("Error");
    builder.Property(v => v.ErrorMessage).IsRequired().HasMaxLength(400);
    builder.Property(v => v.Order).IsRequired().HasDefaultValue(0);

    builder.HasOne(v => v.Corporation)
           .WithMany()
           .HasForeignKey(v => v.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(v => v.WorkflowTypeConfig)
           .WithMany(c => c.Validations)
           .HasForeignKey(v => v.WorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(v => v.WorkflowTypeConfigAction)
           .WithMany()
           .HasForeignKey(v => v.WorkflowTypeConfigActionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
