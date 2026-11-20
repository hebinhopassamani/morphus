using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkflowTypeContextConfiguration : IEntityTypeConfiguration<WorkflowTypeContext>
{
  public void Configure(EntityTypeBuilder<WorkflowTypeContext> builder)
  {
    builder.ToTable("wkf_workflow_type_contexts");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.CorporationId).IsRequired();
    builder.Property(c => c.WorkflowTypeId).IsRequired();
    builder.Property(c => c.AddedInConfigId).IsRequired(false);
    builder.Property(c => c.EntityDefinitionId).IsRequired();
    builder.Property(c => c.Alias).IsRequired().HasMaxLength(120);
    builder.Property(c => c.IsRootEntity).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.IsCollection).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.IsAutoIncluded).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.ParentContextId).IsRequired(false);
    builder.Property(c => c.ForeignKeyPropertyId).IsRequired(false);
    builder.Property(c => c.RelationshipPath).IsRequired(false).HasMaxLength(300);
    builder.Property(c => c.HasUnlinkedWarning).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.PositionX).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.PositionY).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.Order).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(c => new { c.WorkflowTypeId, c.Alias }).IsUnique();

    builder.HasOne(c => c.Corporation)
           .WithMany()
           .HasForeignKey(c => c.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.WorkflowType)
           .WithMany(w => w.Contexts)
           .HasForeignKey(c => c.WorkflowTypeId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(c => c.AddedInConfig)
           .WithMany(cfg => cfg.AddedContexts)
           .HasForeignKey(c => c.AddedInConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(c => c.EntityDefinition)
           .WithMany(e => e.WorkflowContexts)
           .HasForeignKey(c => c.EntityDefinitionId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.ParentContext)
           .WithMany(p => p.ChildContexts)
           .HasForeignKey(c => c.ParentContextId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.ForeignKeyProperty)
           .WithMany()
           .HasForeignKey(c => c.ForeignKeyPropertyId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
