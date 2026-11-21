using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxScreenComponentConfiguration : IEntityTypeConfiguration<MpxScreenComponent>
{
  public void Configure(EntityTypeBuilder<MpxScreenComponent> builder)
  {
    builder.ToTable("mpx_screen_components");
    builder.HasKey(sc => sc.Id);

    builder.Property(sc => sc.CorporationId).IsRequired();
    builder.Property(sc => sc.ComponentTypeId).IsRequired();
    builder.Property(sc => sc.RouteId).IsRequired(false);
    builder.Property(sc => sc.WorkflowTypeId).IsRequired(false);
    builder.Property(sc => sc.StationId).IsRequired(false);
    builder.Property(sc => sc.WorkflowConfigId).IsRequired(false);
    builder.Property(sc => sc.WorkflowActionId).IsRequired(false);
    builder.Property(sc => sc.EntityPropertyId).IsRequired(false);
    builder.Property(sc => sc.ParentComponentId).IsRequired(false);
    builder.Property(sc => sc.ComponentCode).IsRequired().HasMaxLength(120);
    builder.Property(sc => sc.Label).IsRequired().HasMaxLength(150);
    builder.Property(sc => sc.TriggerEvent).IsRequired().HasMaxLength(60).HasDefaultValue("OnClick");
    builder.Property(sc => sc.EmbeddedConfigJson).IsRequired().HasColumnType("text");
    builder.Property(sc => sc.Order).IsRequired().HasDefaultValue(0);
    builder.Property(sc => sc.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(sc => new { sc.CorporationId, sc.ComponentCode }).IsUnique();

    builder.HasOne(sc => sc.Corporation)
           .WithMany()
           .HasForeignKey(sc => sc.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(sc => sc.ComponentType)
           .WithMany(ct => ct.ScreenComponents)
           .HasForeignKey(sc => sc.ComponentTypeId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(sc => sc.Route)
           .WithMany()
           .HasForeignKey(sc => sc.RouteId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(sc => sc.WorkflowType)
           .WithMany()
           .HasForeignKey(sc => sc.WorkflowTypeId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(sc => sc.Station)
           .WithMany()
           .HasForeignKey(sc => sc.StationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(sc => sc.WorkflowConfig)
           .WithMany()
           .HasForeignKey(sc => sc.WorkflowConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(sc => sc.WorkflowAction)
           .WithMany()
           .HasForeignKey(sc => sc.WorkflowActionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(sc => sc.EntityProperty)
           .WithMany()
           .HasForeignKey(sc => sc.EntityPropertyId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(sc => sc.ParentComponent)
           .WithMany(p => p.ChildComponents)
           .HasForeignKey(sc => sc.ParentComponentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
