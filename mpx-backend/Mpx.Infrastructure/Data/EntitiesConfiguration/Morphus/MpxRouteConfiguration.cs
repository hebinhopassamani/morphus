using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxRouteConfiguration : IEntityTypeConfiguration<MpxRoute>
{
  public void Configure(EntityTypeBuilder<MpxRoute> builder)
  {
    builder.ToTable("mpx_routes");
    builder.HasKey(r => r.Id);

    builder.Property(r => r.CorporationId).IsRequired(false);
    builder.Property(r => r.WorkspaceId).IsRequired(false);
    builder.Property(r => r.ApplicationId).IsRequired(false);
    builder.Property(r => r.ModuleId).IsRequired(false);
    builder.Property(r => r.SubModuleId).IsRequired(false);
    builder.Property(r => r.Name).IsRequired().HasMaxLength(120);
    builder.Property(r => r.Label).IsRequired().HasMaxLength(150);
    builder.Property(r => r.Path).IsRequired().HasMaxLength(250);
    builder.Property(r => r.IsPublic).IsRequired().HasDefaultValue(false);
    builder.Property(r => r.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(r => r.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(r => r.Order).IsRequired().HasDefaultValue(0);
    builder.Property(r => r.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(r => new { r.CorporationId, r.Path }).IsUnique();

    builder.HasOne(r => r.Corporation)
           .WithMany()
           .HasForeignKey(r => r.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(r => r.Workspace)
           .WithMany()
           .HasForeignKey(r => r.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(r => r.Application)
           .WithMany()
           .HasForeignKey(r => r.ApplicationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(r => r.Module)
           .WithMany()
           .HasForeignKey(r => r.ModuleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(r => r.SubModule)
           .WithMany()
           .HasForeignKey(r => r.SubModuleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
