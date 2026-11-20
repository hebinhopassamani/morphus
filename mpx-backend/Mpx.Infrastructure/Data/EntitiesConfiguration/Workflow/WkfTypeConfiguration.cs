using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfTypeConfiguration : IEntityTypeConfiguration<WkfType>
{
  public void Configure(EntityTypeBuilder<WkfType> builder)
  {
    builder.ToTable("wkf_workflow_types");
    builder.HasKey(w => w.Id);

    builder.Property(w => w.Name).IsRequired().HasMaxLength(150);
    builder.Property(w => w.CorporationId).IsRequired();
    builder.Property(w => w.WorkspaceId).IsRequired(false);
    builder.Property(w => w.ApplicationId).IsRequired(false);
    builder.Property(w => w.ModuleId).IsRequired(false);
    builder.Property(w => w.SubModuleId).IsRequired(false);
    builder.Property(w => w.RootEntityDefinitionId).IsRequired(false);
    builder.Property(w => w.EntityName).IsRequired(false).HasMaxLength(120);
    builder.Property(w => w.TriggerTypeId).IsRequired(false);
    builder.Property(w => w.TriggerRouteId).IsRequired(false);
    builder.Property(w => w.TriggerType).IsRequired().HasMaxLength(60).HasDefaultValue("HtmlAction");
    builder.Property(w => w.TriggerEvent).IsRequired(false).HasMaxLength(60).HasDefaultValue("OnScreenLoad");
    builder.Property(w => w.ViewportX).IsRequired().HasDefaultValue(0);
    builder.Property(w => w.ViewportY).IsRequired().HasDefaultValue(0);
    builder.Property(w => w.ViewportZoom).IsRequired().HasDefaultValue(1.0);
    builder.Property(w => w.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(w => w.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(w => w.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(w => w.TriggerTypeDefinition)
           .WithMany(t => t.WorkflowTypes)
           .HasForeignKey(w => w.TriggerTypeId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(w => w.TriggerRoute)
           .WithMany(r => r.TriggerWorkflowTypes)
           .HasForeignKey(w => w.TriggerRouteId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(w => w.Corporation)
           .WithMany()
           .HasForeignKey(w => w.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.Workspace)
           .WithMany()
           .HasForeignKey(w => w.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.Application)
           .WithMany()
           .HasForeignKey(w => w.ApplicationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.Module)
           .WithMany()
           .HasForeignKey(w => w.ModuleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.SubModule)
           .WithMany()
           .HasForeignKey(w => w.SubModuleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(w => w.RootEntityDefinition)
           .WithMany()
           .HasForeignKey(w => w.RootEntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
