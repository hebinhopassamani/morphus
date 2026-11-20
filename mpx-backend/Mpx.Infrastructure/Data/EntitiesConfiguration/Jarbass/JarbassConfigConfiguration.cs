using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JarbassConfigConfiguration : IEntityTypeConfiguration<JarbassConfig>
{
  public void Configure(EntityTypeBuilder<JarbassConfig> builder)
  {
    builder.ToTable("jrb_config");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.CorporationId).IsRequired(false);
    builder.Property(c => c.WorkspaceId).IsRequired(false);
    builder.Property(c => c.JarbassAgentId).IsRequired(false);
    builder.Property(c => c.IsSingleton).IsRequired().HasDefaultValue(true);

    builder.Property(c => c.MorphusServerUrl).IsRequired().HasMaxLength(300).HasDefaultValue("https://api.morphus.one");
    builder.Property(c => c.ApiKeyPrefix).IsRequired(false).HasMaxLength(40);
    builder.Property(c => c.ApiKeyHash).IsRequired(false).HasMaxLength(128);
    builder.Property(c => c.ApiKeyEncrypted).IsRequired(false).HasMaxLength(1000);
    builder.Property(c => c.SigningSecretEncrypted).IsRequired(false).HasMaxLength(1000);
    builder.Property(c => c.IsPaired).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.PairedAtUtc).IsRequired(false);
    builder.Property(c => c.ApiKeyRevoked).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.ApiKeyExpiresAtUtc).IsRequired(false);

    builder.Property(c => c.ClientDatabaseProvider).IsRequired().HasMaxLength(40).HasDefaultValue("PostgreSQL");
    builder.Property(c => c.ClientDatabaseConnectionStringEncrypted).IsRequired(false).HasMaxLength(2000);
    builder.Property(c => c.ClientAppFolderPath).IsRequired(false).HasMaxLength(500);
    builder.Property(c => c.KalupaVaultFolderPath).IsRequired(false).HasMaxLength(500);

    builder.Property(c => c.EnvironmentMode).IsRequired().HasMaxLength(40).HasDefaultValue("Server");
    builder.Property(c => c.LastTrustedServerUtc).IsRequired(false);
    builder.Property(c => c.LastCpuTickAnchor).IsRequired().HasDefaultValue(0L);
    builder.Property(c => c.HighWaterMarkUtc).IsRequired(false);
    builder.Property(c => c.LastChainHash).IsRequired(false).HasMaxLength(128);
    builder.Property(c => c.LastSyncedSequenceNumber).IsRequired().HasDefaultValue(0L);
    builder.Property(c => c.MaxAllowedClockDriftSeconds).IsRequired().HasDefaultValue(45);
    builder.Property(c => c.BlockSyncOnClockTampering).IsRequired().HasDefaultValue(false);

    builder.Property(c => c.CatalogReflectionEnabled).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.CatalogReflectionIntervalSeconds).IsRequired().HasDefaultValue(60);
    builder.Property(c => c.WorkflowWatcherEnabled).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.WorkflowWatcherIntervalSeconds).IsRequired().HasDefaultValue(15);
    builder.Property(c => c.EmailDispatcherEnabled).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.EmailDispatcherIntervalSeconds).IsRequired().HasDefaultValue(10);
    builder.Property(c => c.KalupaSyncEnabled).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.KalupaSyncIntervalSeconds).IsRequired().HasDefaultValue(15);
    builder.Property(c => c.OfflineSyncEnabled).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.OfflineSyncIntervalSeconds).IsRequired().HasDefaultValue(10);
    builder.Property(c => c.AutoHealEnabled).IsRequired().HasDefaultValue(true);
    builder.Property(c => c.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(c => new { c.CorporationId, c.JarbassAgentId }).IsUnique();

    builder.HasOne(c => c.Corporation)
           .WithMany()
           .HasForeignKey(c => c.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.Workspace)
           .WithMany()
           .HasForeignKey(c => c.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(c => c.JarbassAgent)
           .WithMany(a => a.Configs)
           .HasForeignKey(c => c.JarbassAgentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
