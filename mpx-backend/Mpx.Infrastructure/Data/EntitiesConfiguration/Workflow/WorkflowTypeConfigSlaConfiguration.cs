using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTypeConfigSlaConfiguration : IEntityTypeConfiguration<WorkflowTypeConfigSla>
{
  public void Configure(EntityTypeBuilder<WorkflowTypeConfigSla> builder)
  {
    builder.ToTable("wkf_workflow_type_config_slas");
    builder.HasKey(s => s.Id);

    builder.Property(s => s.Name).IsRequired().HasMaxLength(120);
    builder.Property(s => s.CorporationId).IsRequired();
    builder.Property(s => s.WorkflowTypeConfigId).IsRequired();
    builder.Property(s => s.Severity).IsRequired().HasMaxLength(40).HasDefaultValue("warning");
    builder.Property(s => s.Color).IsRequired().HasMaxLength(40).HasDefaultValue("amber");
    builder.Property(s => s.Percentage).IsRequired();
    builder.Property(s => s.RepeatIntervalMinutes).IsRequired(false);
    builder.Property(s => s.Order).IsRequired().HasDefaultValue(0);
    builder.Property(s => s.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(s => s.Corporation)
           .WithMany()
           .HasForeignKey(s => s.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(s => s.WorkflowTypeConfig)
           .WithMany(c => c.Slas)
           .HasForeignKey(s => s.WorkflowTypeConfigId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
