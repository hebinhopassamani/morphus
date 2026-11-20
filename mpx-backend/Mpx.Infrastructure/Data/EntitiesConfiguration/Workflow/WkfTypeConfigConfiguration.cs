using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfTypeConfigConfiguration : IEntityTypeConfiguration<WkfTypeConfig>
{
  public void Configure(EntityTypeBuilder<WkfTypeConfig> builder)
  {
    builder.ToTable("wkf_workflow_type_configs");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
    builder.Property(c => c.CorporationId).IsRequired();
    builder.Property(c => c.WorkflowTypeId).IsRequired();
    builder.Property(c => c.StationId).IsRequired();
    builder.Property(c => c.Order).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.PositionX).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.PositionY).IsRequired().HasDefaultValue(0);
    builder.Property(c => c.Width).IsRequired(false);
    builder.Property(c => c.Height).IsRequired(false);
    builder.Property(c => c.HasLayout).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.CustomLayoutHtml).IsRequired(false).HasColumnType("text");
    builder.Property(c => c.AssignmentMode).IsRequired().HasMaxLength(40).HasDefaultValue("GroupQueue");
    builder.Property(c => c.MaxOwners).IsRequired().HasDefaultValue(1);
    builder.Property(c => c.MaxTasksPerUser).IsRequired(false);
    builder.Property(c => c.QuorumPercentage).IsRequired(false);
    builder.Property(c => c.QuorumMinVotes).IsRequired(false);
    builder.Property(c => c.AutoAdvanceOnQuorumReached).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.HasRapporteur).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.RequiresRapporteurFirst).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.RapporteurTieBreaker).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.SlaMinutes).IsRequired(false);
    builder.Property(c => c.HoldInactiveUntilApproved).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(c => c.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(c => c.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(c => c.Corporation)
           .WithMany()
           .HasForeignKey(c => c.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.WorkflowType)
           .WithMany(w => w.Configs)
           .HasForeignKey(c => c.WorkflowTypeId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(c => c.Station)
           .WithMany(s => s.WorkflowTypeConfigs)
           .HasForeignKey(c => c.StationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
