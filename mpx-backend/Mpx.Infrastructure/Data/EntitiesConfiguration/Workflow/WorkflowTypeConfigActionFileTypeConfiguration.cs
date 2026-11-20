using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTypeConfigActionFileTypeConfiguration : IEntityTypeConfiguration<WorkflowTypeConfigActionFileType>
{
  public void Configure(EntityTypeBuilder<WorkflowTypeConfigActionFileType> builder)
  {
    builder.ToTable("wkf_workflow_type_config_action_file_types");
    builder.HasKey(af => new { af.WorkflowTypeConfigActionId, af.FileTypeId });

    builder.Property(af => af.CorporationId).IsRequired();
    builder.Property(af => af.WorkflowTypeConfigActionId).IsRequired();
    builder.Property(af => af.FileTypeId).IsRequired();

    builder.HasOne(af => af.Corporation)
           .WithMany()
           .HasForeignKey(af => af.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(af => af.WorkflowTypeConfigAction)
           .WithMany(a => a.AllowedFileTypes)
           .HasForeignKey(af => af.WorkflowTypeConfigActionId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(af => af.FileType)
           .WithMany()
           .HasForeignKey(af => af.FileTypeId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
