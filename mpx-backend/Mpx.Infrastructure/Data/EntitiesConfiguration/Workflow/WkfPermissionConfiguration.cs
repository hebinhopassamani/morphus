using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfPermissionConfiguration : IEntityTypeConfiguration<WkfPermission>
{
  public void Configure(EntityTypeBuilder<WkfPermission> builder)
  {
    builder.ToTable("wkf_workflow_permissions");
    builder.HasKey(p => p.Id);

    builder.Property(p => p.CorporationId).IsRequired();
    builder.Property(p => p.WorkflowTypeId).IsRequired();
    builder.Property(p => p.WorkflowTypeConfigId).IsRequired(false);
    builder.Property(p => p.WorkflowTypeConfigActionId).IsRequired(false);
    builder.Property(p => p.WorkflowTypeConfigFieldId).IsRequired(false);
    builder.Property(p => p.WorkspaceId).IsRequired(false);
    builder.Property(p => p.RoleId).IsRequired(false);
    builder.Property(p => p.ClaimId).IsRequired(false);
    builder.Property(p => p.UserId).IsRequired(false);
    builder.Property(p => p.CanView).IsRequired().HasDefaultValue(true);
    builder.Property(p => p.CanEdit).IsRequired().HasDefaultValue(false);
    builder.Property(p => p.CanExecute).IsRequired().HasDefaultValue(false);

    builder.HasOne(p => p.Corporation)
           .WithMany()
           .HasForeignKey(p => p.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(p => p.WorkflowType)
           .WithMany(w => w.Permissions)
           .HasForeignKey(p => p.WorkflowTypeId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.WorkflowTypeConfig)
           .WithMany(c => c.Permissions)
           .HasForeignKey(p => p.WorkflowTypeConfigId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.WorkflowTypeConfigAction)
           .WithMany(a => a.Permissions)
           .HasForeignKey(p => p.WorkflowTypeConfigActionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.WorkflowTypeConfigField)
           .WithMany(f => f.Permissions)
           .HasForeignKey(p => p.WorkflowTypeConfigFieldId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.Workspace)
           .WithMany()
           .HasForeignKey(p => p.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.Role)
           .WithMany()
           .HasForeignKey(p => p.RoleId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.Claim)
           .WithMany()
           .HasForeignKey(p => p.ClaimId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(p => p.User)
           .WithMany()
           .HasForeignKey(p => p.UserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
