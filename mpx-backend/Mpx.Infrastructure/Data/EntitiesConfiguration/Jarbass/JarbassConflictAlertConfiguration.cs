using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JarbassConflictAlertConfiguration : IEntityTypeConfiguration<JarbassConflictAlert>
{
  public void Configure(EntityTypeBuilder<JarbassConflictAlert> builder)
  {
    builder.ToTable("jrb_conflict_alerts");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.CorporationId).IsRequired(false);
    builder.Property(c => c.JarbassSyncEventId).IsRequired();
    builder.Property(c => c.RejectedJarbassAgentId).IsRequired();
    builder.Property(c => c.WinnerJarbassAgentId).IsRequired(false);
    builder.Property(c => c.NotifyUserId).IsRequired(false);
    builder.Property(c => c.EntityDefinitionId).IsRequired(false);
    builder.Property(c => c.EntityName).IsRequired().HasMaxLength(120);
    builder.Property(c => c.ExistingEntityId).IsRequired();
    builder.Property(c => c.RejectedEntityId).IsRequired();
    builder.Property(c => c.UniqueKeyName).IsRequired().HasMaxLength(120);
    builder.Property(c => c.UniqueKeyValue).IsRequired().HasMaxLength(250);
    builder.Property(c => c.Message).IsRequired().HasMaxLength(1000);
    builder.Property(c => c.RejectedPayloadJson).IsRequired(false);
    builder.Property(c => c.ResolutionStatus).IsRequired().HasMaxLength(40).HasDefaultValue("PendingUserAction");
    builder.Property(c => c.DetectedAtUtc).IsRequired();
    builder.Property(c => c.ResolvedAtUtc).IsRequired(false);
    builder.Property(c => c.ResolvedByUserId).IsRequired(false);
    builder.Property(c => c.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(c => new { c.CorporationId, c.ResolutionStatus });
    builder.HasIndex(c => new { c.NotifyUserId, c.ResolutionStatus });

    builder.HasOne(c => c.Corporation)
           .WithMany()
           .HasForeignKey(c => c.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.JarbassSyncEvent)
           .WithMany(e => e.ConflictAlerts)
           .HasForeignKey(c => c.JarbassSyncEventId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(c => c.RejectedJarbassAgent)
           .WithMany(a => a.ConflictAlerts)
           .HasForeignKey(c => c.RejectedJarbassAgentId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.WinnerJarbassAgent)
           .WithMany()
           .HasForeignKey(c => c.WinnerJarbassAgentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(c => c.NotifyUser)
           .WithMany()
           .HasForeignKey(c => c.NotifyUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(c => c.ResolvedByUser)
           .WithMany()
           .HasForeignKey(c => c.ResolvedByUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(c => c.EntityDefinition)
           .WithMany()
           .HasForeignKey(c => c.EntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
