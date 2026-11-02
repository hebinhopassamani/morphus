using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkspaceUserConfiguration : IEntityTypeConfiguration<WorkspaceUser>
{
  public void Configure(EntityTypeBuilder<WorkspaceUser> builder)
  {
    builder.ToTable("workspace_users");

    builder.HasKey(wu => new { wu.WorkspaceId, wu.UserId });

    builder.Property(wu => wu.WorkspaceId).IsRequired();
    builder.Property(wu => wu.UserId).IsRequired();
    builder.Property(wu => wu.CorporationId).IsRequired();
    builder.Property(wu => wu.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(wu => wu.System).IsRequired().HasDefaultValue(false);
    builder.Property(wu => wu.IsOwner).IsRequired().HasDefaultValue(false);

    builder.HasOne(wu => wu.Workspace)
           .WithMany(w => w.WorkspaceUsers)
           .HasForeignKey(wu => wu.WorkspaceId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(wu => wu.User)
           .WithMany(u => u.WorkspaceUsers)
           .HasForeignKey(wu => wu.UserId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(wu => wu.Corporation)
           .WithMany(c => c.WorkspaceUsers)
           .HasForeignKey(wu => wu.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
