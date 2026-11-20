using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JarbassSyncEventConfiguration : IEntityTypeConfiguration<JarbassSyncEvent>
{
  public void Configure(EntityTypeBuilder<JarbassSyncEvent> builder)
  {
    builder.ToTable("jrb_sync_events");
    builder.HasKey(e => e.Id);

    builder.Property(e => e.CorporationId).IsRequired(false);
    builder.Property(e => e.JarbassAgentId).IsRequired();
    builder.Property(e => e.ParentSyncEventId).IsRequired(false);
    builder.Property(e => e.UserId).IsRequired(false);
    builder.Property(e => e.SequenceNumber).IsRequired();
    builder.Property(e => e.TransactionGroupId).IsRequired();
    builder.Property(e => e.Operation).IsRequired().HasMaxLength(30).HasDefaultValue("Create");
    builder.Property(e => e.EntityDefinitionId).IsRequired(false);
    builder.Property(e => e.EntityName).IsRequired().HasMaxLength(120);
    builder.Property(e => e.TableName).IsRequired().HasMaxLength(120);
    builder.Property(e => e.TargetEntityId).IsRequired();
    builder.Property(e => e.TargetEntityKey).IsRequired(false).HasMaxLength(100);
    builder.Property(e => e.UniqueKeyName).IsRequired(false).HasMaxLength(120);
    builder.Property(e => e.UniqueKeyValue).IsRequired(false).HasMaxLength(250);
    builder.Property(e => e.PayloadJson).IsRequired(false);
    builder.Property(e => e.ChangedFieldsJson).IsRequired(false);
    builder.Property(e => e.EfCommandText).IsRequired(false);
    builder.Property(e => e.EfParametersJson).IsRequired(false);

    builder.Property(e => e.MachineName).IsRequired().HasMaxLength(120).HasDefaultValue(string.Empty);
    builder.Property(e => e.EnvironmentMode).IsRequired().HasMaxLength(40).HasDefaultValue("Server");
    builder.Property(e => e.ExecutionChannel).IsRequired().HasMaxLength(60).HasDefaultValue("DirectEntity");
    builder.Property(e => e.SourceEndpoint).IsRequired(false).HasMaxLength(300);
    builder.Property(e => e.IpAddress).IsRequired(false).HasMaxLength(60);

    builder.Property(e => e.ReportedDeviceUtc).IsRequired();
    builder.Property(e => e.TrustedOccurredAtUtc).IsRequired();
    builder.Property(e => e.ExecutionStartedAtUtc).IsRequired(false);
    builder.Property(e => e.ExecutionCompletedAtUtc).IsRequired(false);
    builder.Property(e => e.ExecutionDurationMs).IsRequired(false);
    builder.Property(e => e.CpuTickAtEvent).IsRequired().HasDefaultValue(0L);
    builder.Property(e => e.ClockTampered).IsRequired().HasDefaultValue(false);
    builder.Property(e => e.ClockSkewSeconds).IsRequired(false);

    builder.Property(e => e.Executed).IsRequired().HasDefaultValue(false);
    builder.Property(e => e.ExecutionSucceeded).IsRequired().HasDefaultValue(false);
    builder.Property(e => e.Synced).IsRequired().HasDefaultValue(false);
    builder.Property(e => e.RowsAffected).IsRequired(false);
    builder.Property(e => e.RetryCount).IsRequired().HasDefaultValue(0);
    builder.Property(e => e.PreviousHash).IsRequired(false).HasMaxLength(128);
    builder.Property(e => e.Hash).IsRequired().HasMaxLength(128);
    builder.Property(e => e.SyncStatus).IsRequired().HasMaxLength(40).HasDefaultValue("Pending");
    builder.Property(e => e.SyncedAtUtc).IsRequired(false);
    builder.Property(e => e.ErrorMessage).IsRequired(false).HasMaxLength(1000);
    builder.Property(e => e.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(e => new { e.JarbassAgentId, e.SequenceNumber }).IsUnique();
    builder.HasIndex(e => new { e.Synced, e.SequenceNumber });
    builder.HasIndex(e => new { e.SyncStatus, e.TrustedOccurredAtUtc });

    builder.HasOne(e => e.Corporation)
           .WithMany()
           .HasForeignKey(e => e.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.JarbassAgent)
           .WithMany(a => a.SyncEvents)
           .HasForeignKey(e => e.JarbassAgentId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(e => e.ParentSyncEvent)
           .WithMany(p => p.ChildSyncEvents)
           .HasForeignKey(e => e.ParentSyncEventId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.User)
           .WithMany()
           .HasForeignKey(e => e.UserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(e => e.EntityDefinition)
           .WithMany()
           .HasForeignKey(e => e.EntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
