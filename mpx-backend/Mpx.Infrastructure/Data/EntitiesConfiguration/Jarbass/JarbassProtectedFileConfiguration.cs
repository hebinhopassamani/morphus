using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JarbassProtectedFileConfiguration : IEntityTypeConfiguration<JarbassProtectedFile>
{
  public void Configure(EntityTypeBuilder<JarbassProtectedFile> builder)
  {
    builder.ToTable("jrb_protected_files");
    builder.HasKey(f => f.Id);

    builder.Property(f => f.CorporationId).IsRequired(false);
    builder.Property(f => f.WorkspaceId).IsRequired(false);
    builder.Property(f => f.JarbassAgentId).IsRequired(false);
    builder.Property(f => f.CurrentHolderUserId).IsRequired(false);
    builder.Property(f => f.FileName).IsRequired().HasMaxLength(250);
    builder.Property(f => f.RelativeVaultPath).IsRequired().HasMaxLength(500);
    builder.Property(f => f.FullLocalPath).IsRequired().HasMaxLength(1000);
    builder.Property(f => f.RequiredClaimKey).IsRequired(false).HasMaxLength(120);
    builder.Property(f => f.PermissionLevel).IsRequired().HasMaxLength(40).HasDefaultValue("ReadOnly");
    builder.Property(f => f.EncryptionState).IsRequired().HasMaxLength(40).HasDefaultValue("EncryptedAtRest");
    builder.Property(f => f.PlaintextContentHash).IsRequired().HasMaxLength(128);
    builder.Property(f => f.EncryptedContentHash).IsRequired().HasMaxLength(128);
    builder.Property(f => f.FileKeyEncrypted).IsRequired(false).HasMaxLength(1000);
    builder.Property(f => f.EncryptedBackupPayload).IsRequired(false);
    builder.Property(f => f.IsHeldInHand).IsRequired().HasDefaultValue(false);
    builder.Property(f => f.LeaseOpenedAtUtc).IsRequired(false);
    builder.Property(f => f.LeaseExpiresAtUtc).IsRequired(false);
    builder.Property(f => f.ForceCloseRequested).IsRequired().HasDefaultValue(false);
    builder.Property(f => f.TamperAttemptsCount).IsRequired().HasDefaultValue(0);
    builder.Property(f => f.LastTamperAttemptUtc).IsRequired(false);
    builder.Property(f => f.LastRevokedReason).IsRequired(false).HasMaxLength(500);
    builder.Property(f => f.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(f => new { f.JarbassAgentId, f.RelativeVaultPath }).IsUnique();
    builder.HasIndex(f => new { f.IsHeldInHand, f.LeaseExpiresAtUtc });

    builder.HasOne(f => f.Corporation)
           .WithMany()
           .HasForeignKey(f => f.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.Workspace)
           .WithMany()
           .HasForeignKey(f => f.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(f => f.JarbassAgent)
           .WithMany(a => a.ProtectedFiles)
           .HasForeignKey(f => f.JarbassAgentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(f => f.CurrentHolderUser)
           .WithMany()
           .HasForeignKey(f => f.CurrentHolderUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
