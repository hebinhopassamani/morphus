using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfItemConfiguration : IEntityTypeConfiguration<WkfItem>
{
  public void Configure(EntityTypeBuilder<WkfItem> builder)
  {
    builder.ToTable("wkf_workflow_items");
    builder.HasKey(i => i.Id);

    builder.Property(i => i.CorporationId).IsRequired();
    builder.Property(i => i.WorkflowId).IsRequired();
    builder.Property(i => i.ParentWorkflowItemId).IsRequired(false);
    builder.Property(i => i.WorkflowTypeContextId).IsRequired(false);
    builder.Property(i => i.EntityDefinitionId).IsRequired(false);
    builder.Property(i => i.AddedInConfigId).IsRequired(false);
    builder.Property(i => i.WorkflowTypeConfigFieldId).IsRequired(false);
    builder.Property(i => i.AddedByUserId).IsRequired(false);
    builder.Property(i => i.ItemType).IsRequired().HasMaxLength(40).HasDefaultValue("Entity");
    builder.Property(i => i.IsPrimaryEntity).IsRequired().HasDefaultValue(false);
    builder.Property(i => i.EntityName).IsRequired(false).HasMaxLength(120);
    builder.Property(i => i.EntityAlias).IsRequired(false).HasMaxLength(120);
    builder.Property(i => i.EntityId).IsRequired(false);
    builder.Property(i => i.FileName).IsRequired(false).HasMaxLength(260);
    builder.Property(i => i.MimeType).IsRequired(false).HasMaxLength(150);
    builder.Property(i => i.FileSize).IsRequired(false);
    builder.Property(i => i.StorageUrl).IsRequired(false).HasMaxLength(500);
    builder.Property(i => i.PayloadJson).IsRequired(false).HasColumnType("text");
    builder.Property(i => i.PendingActivation).IsRequired().HasDefaultValue(false);

    builder.HasOne(i => i.Corporation)
           .WithMany()
           .HasForeignKey(i => i.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(i => i.Workflow)
           .WithMany(w => w.Items)
           .HasForeignKey(i => i.WorkflowId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(i => i.ParentWorkflowItem)
           .WithMany(p => p.ChildItems)
           .HasForeignKey(i => i.ParentWorkflowItemId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(i => i.WorkflowTypeContext)
           .WithMany(ctx => ctx.Items)
           .HasForeignKey(i => i.WorkflowTypeContextId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(i => i.EntityDefinition)
           .WithMany()
           .HasForeignKey(i => i.EntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(i => i.AddedInConfig)
           .WithMany()
           .HasForeignKey(i => i.AddedInConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(i => i.WorkflowTypeConfigField)
           .WithMany()
           .HasForeignKey(i => i.WorkflowTypeConfigFieldId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(i => i.AddedByUser)
           .WithMany()
           .HasForeignKey(i => i.AddedByUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
