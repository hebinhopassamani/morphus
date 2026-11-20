using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbAgentConfiguration : IEntityTypeConfiguration<JrbAgent>
{
  public void Configure(EntityTypeBuilder<JrbAgent> builder)
  {
    builder.ToTable("jrb_agents");
    builder.HasKey(a => a.Id);

    builder.Property(a => a.CorporationId).IsRequired(false);
    builder.Property(a => a.WorkspaceId).IsRequired(false);
    builder.Property(a => a.UserId).IsRequired(false);
    builder.Property(a => a.Name).IsRequired().HasMaxLength(120);
    builder.Property(a => a.MachineName).IsRequired().HasMaxLength(120);
    builder.Property(a => a.OperatingSystem).IsRequired(false).HasMaxLength(120);
    builder.Property(a => a.IpAddress).IsRequired(false).HasMaxLength(60);
    builder.Property(a => a.Version).IsRequired().HasMaxLength(40).HasDefaultValue("1.0.0");
    builder.Property(a => a.EnvironmentMode).IsRequired().HasMaxLength(40).HasDefaultValue("Server");
    builder.Property(a => a.Status).IsRequired().HasMaxLength(40).HasDefaultValue("Online");
    builder.Property(a => a.IsOfflineCapable).IsRequired().HasDefaultValue(true);
    builder.Property(a => a.LastHeartbeatUtc).IsRequired(false);
    builder.Property(a => a.LastTrustedServerUtc).IsRequired(false);
    builder.Property(a => a.LastCpuTickAnchor).IsRequired().HasDefaultValue(0L);
    builder.Property(a => a.HighWaterMarkUtc).IsRequired(false);
    builder.Property(a => a.LastChainHash).IsRequired(false).HasMaxLength(128);
    builder.Property(a => a.LastSyncedSequenceNumber).IsRequired().HasDefaultValue(0L);
    builder.Property(a => a.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(a => new { a.CorporationId, a.MachineName });

    builder.HasOne(a => a.Corporation)
           .WithMany()
           .HasForeignKey(a => a.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(a => a.Workspace)
           .WithMany()
           .HasForeignKey(a => a.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(a => a.User)
           .WithMany()
           .HasForeignKey(a => a.UserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
