using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbJobConfiguration : IEntityTypeConfiguration<JrbJob>
{
  public void Configure(EntityTypeBuilder<JrbJob> builder)
  {
    builder.ToTable("jrb_jobs");
    builder.HasKey(j => j.Id);

    builder.Property(j => j.CorporationId).IsRequired(false);
    builder.Property(j => j.JarbassAgentId).IsRequired(false);
    builder.Property(j => j.Code).IsRequired().HasMaxLength(80);
    builder.Property(j => j.Name).IsRequired().HasMaxLength(150);
    builder.Property(j => j.Category).IsRequired().HasMaxLength(60).HasDefaultValue("System");
    builder.Property(j => j.IntervalSeconds).IsRequired().HasDefaultValue(60);
    builder.Property(j => j.Enabled).IsRequired().HasDefaultValue(true);
    builder.Property(j => j.LastRunStatus).IsRequired().HasMaxLength(40).HasDefaultValue("Idle");
    builder.Property(j => j.LastRunUtc).IsRequired(false);
    builder.Property(j => j.NextRunUtc).IsRequired(false);
    builder.Property(j => j.LastDurationMs).IsRequired(false);
    builder.Property(j => j.TotalRuns).IsRequired().HasDefaultValue(0L);
    builder.Property(j => j.TotalFailures).IsRequired().HasDefaultValue(0L);
    builder.Property(j => j.LastErrorMessage).IsRequired(false).HasMaxLength(1000);
    builder.Property(j => j.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(j => new { j.JarbassAgentId, j.Code }).IsUnique();

    builder.HasOne(j => j.Corporation)
           .WithMany()
           .HasForeignKey(j => j.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(j => j.JarbassAgent)
           .WithMany(a => a.Jobs)
           .HasForeignKey(j => j.JarbassAgentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
