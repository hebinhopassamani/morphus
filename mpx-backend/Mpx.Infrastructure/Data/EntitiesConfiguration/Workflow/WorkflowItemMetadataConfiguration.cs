using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowItemMetadataConfiguration : IEntityTypeConfiguration<WorkflowItemMetadata>
{
  public void Configure(EntityTypeBuilder<WorkflowItemMetadata> builder)
  {
    builder.ToTable("wkf_workflow_item_metadatas");
    builder.HasKey(m => m.Id);

    builder.Property(m => m.CorporationId).IsRequired();
    builder.Property(m => m.WorkflowItemId).IsRequired();
    builder.Property(m => m.WorkflowTypeConfigId).IsRequired(false);
    builder.Property(m => m.WorkflowTypeConfigFieldId).IsRequired(false);
    builder.Property(m => m.MetadataKey).IsRequired().HasMaxLength(150);
    builder.Property(m => m.Value).IsRequired(false).HasColumnType("text");
    builder.Property(m => m.DataType).IsRequired().HasMaxLength(40).HasDefaultValue("text");
    builder.Property(m => m.Tag).IsRequired(false).HasMaxLength(120);
    builder.Property(m => m.IsCritical).IsRequired().HasDefaultValue(false);
    builder.Property(m => m.RequiredClaimId).IsRequired(false);

    builder.HasOne(m => m.Corporation)
           .WithMany()
           .HasForeignKey(m => m.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(m => m.WorkflowItem)
           .WithMany(i => i.Metadatas)
           .HasForeignKey(m => m.WorkflowItemId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(m => m.WorkflowTypeConfig)
           .WithMany()
           .HasForeignKey(m => m.WorkflowTypeConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(m => m.WorkflowTypeConfigField)
           .WithMany()
           .HasForeignKey(m => m.WorkflowTypeConfigFieldId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(m => m.RequiredClaim)
           .WithMany()
           .HasForeignKey(m => m.RequiredClaimId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
