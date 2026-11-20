using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTypeConfigActionConfiguration : IEntityTypeConfiguration<WorkflowTypeConfigAction>
{
  public void Configure(EntityTypeBuilder<WorkflowTypeConfigAction> builder)
  {
    builder.ToTable("wkf_workflow_type_config_actions");
    builder.HasKey(a => a.Id);

    builder.Property(a => a.Name).IsRequired().HasMaxLength(120);
    builder.Property(a => a.Label).IsRequired().HasMaxLength(120);
    builder.Property(a => a.ControlType).IsRequired().HasMaxLength(40).HasDefaultValue("Button");
    builder.Property(a => a.ExecuteWhen).IsRequired().HasMaxLength(40).HasDefaultValue("ButtonClick");
    builder.Property(a => a.CorporationId).IsRequired();
    builder.Property(a => a.WorkflowTypeConfigId).IsRequired();
    builder.Property(a => a.NextWorkflowTypeConfigId).IsRequired(false);
    builder.Property(a => a.IsAutomatic).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.AutoExecuteAfterMinutes).IsRequired(false);
    builder.Property(a => a.AutoExecuteOnSlaBreach).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.RequiresOpinion).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.OpinionMinLength).IsRequired(false);
    builder.Property(a => a.AllowsAttachments).IsRequired().HasDefaultValue(true);
    builder.Property(a => a.RequiresAttachments).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.MinAttachments).IsRequired(false);
    builder.Property(a => a.MaxAttachments).IsRequired(false);
    builder.Property(a => a.Order).IsRequired().HasDefaultValue(0);
    builder.Property(a => a.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(a => a.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(a => a.CustomCss).IsRequired(false).HasColumnType("text");
    builder.Property(a => a.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(a => a.Corporation)
           .WithMany()
           .HasForeignKey(a => a.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(a => a.WorkflowTypeConfig)
           .WithMany(c => c.Actions)
           .HasForeignKey(a => a.WorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(a => a.NextWorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(a => a.NextWorkflowTypeConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
