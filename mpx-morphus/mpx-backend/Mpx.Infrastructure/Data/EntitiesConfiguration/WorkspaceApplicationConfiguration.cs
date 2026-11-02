using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkspaceApplicationConfiguration : IEntityTypeConfiguration<WorkspaceApplication>
{
  public void Configure(EntityTypeBuilder<WorkspaceApplication> builder)
  {
    builder.ToTable("workspace_applications");

    builder.HasKey(wa => new { wa.WorkspaceId, wa.ApplicationId });

    builder.Property(wa => wa.WorkspaceId).IsRequired();
    builder.Property(wa => wa.ApplicationId).IsRequired();
    builder.Property(wa => wa.CorporationId).IsRequired();
    builder.Property(wa => wa.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(wa => wa.System).IsRequired().HasDefaultValue(false);

    builder.HasOne(wa => wa.Corporation)
           .WithMany(c => c.WorkspaceApplications)
           .HasForeignKey(wa => wa.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(wa => wa.Workspace)
           .WithMany(w => w.WorkspaceApplications)
           .HasForeignKey(wa => wa.WorkspaceId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(wa => wa.Application)
           .WithMany(a => a.WorkspaceApplications)
           .HasForeignKey(wa => wa.ApplicationId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
