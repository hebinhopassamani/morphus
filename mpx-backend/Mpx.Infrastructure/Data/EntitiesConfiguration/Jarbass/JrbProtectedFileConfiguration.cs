using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbProtectedFileConfiguration : IEntityTypeConfiguration<JrbProtectedFile>
{
  public void Configure(EntityTypeBuilder<JrbProtectedFile> builder)
  {
    builder.ToTable("jrb_protected_files");
    builder.HasKey(f => f.Id);

    builder.Property(f => f.CorporationId).IsRequired(false);
    builder.Property(f => f.WorkspaceId).IsRequired(false);
    builder.Property(f => f.JarbassAgentId).IsRequired(false);
    builder.Property(f => f.FileTypeId).IsRequired(false);
    builder.Property(f => f.CurrentHolderUserId).IsRequired(false);
    builder.Property(f => f.FileName).IsRequired().HasMaxLength(250);
    builder.Property(f => f.RelativeVaultPath).IsRequired().HasMaxLength(500);
    builder.Property(f => f.FullLocalPath).IsRequired().HasMaxLength(1000);
    builder.Property(f => f.SecurityScopeId).IsRequired(false);
    builder.Property(f => f.InstanceSecurityLevelId).IsRequired(false);
    builder.Property(f => f.EffectiveSecurityLevelId).IsRequired(false);
    builder.Property(f => f.PermissionLevelId).IsRequired(false);
    builder.Property(f => f.EncryptionStateId).IsRequired(false);
    builder.Property(f => f.EncryptedMetadataHeader).IsRequired(false).HasColumnType("text");
    builder.Property(f => f.InnerContentSignature).IsRequired(false).HasMaxLength(128);
    builder.Property(f => f.OuterEnvelopeSignature).IsRequired(false).HasMaxLength(128);
    builder.Property(f => f.RequiredClaimKey).IsRequired(false).HasMaxLength(120);
    builder.Property(f => f.PlaintextContentHash).IsRequired().HasMaxLength(128);
    builder.Property(f => f.EncryptedContentHash).IsRequired().HasMaxLength(128);
    builder.Property(f => f.FileKeyEncrypted).IsRequired(false).HasMaxLength(1000);
    builder.Property(f => f.EncryptedBackupPayload).IsRequired(false);
    builder.Property(f => f.IsHeldInHand).IsRequired().HasDefaultValue(false);
    builder.Property(f => f.LeaseOpenedAtUtc).IsRequired(false);
    builder.Property(f => f.LeaseExpiresAtUtc).IsRequired(false);
    builder.Property(f => f.LastOnlineSecurityVerifiedAtUtc).IsRequired(false);
    builder.Property(f => f.ForceCloseRequested).IsRequired().HasDefaultValue(false);
    builder.Property(f => f.TamperAttemptsCount).IsRequired().HasDefaultValue(0);
    builder.Property(f => f.LastTamperAttemptUtc).IsRequired(false);
    builder.Property(f => f.LastRevokedReason).IsRequired(false).HasMaxLength(500);
    builder.Property(f => f.Description).IsRequired(false).HasMaxLength(300);

    // Índices compostos B-Tree em cima das Foreign Keys UUID + boolean (zero string solta, sub-milissegundo em milhões de arquivos!)
    builder.HasIndex(f => new { f.JarbassAgentId, f.RelativeVaultPath }).IsUnique();
    builder.HasIndex(f => new { f.IsHeldInHand, f.EncryptionStateId, f.LeaseExpiresAtUtc });
    builder.HasIndex(f => new { f.FileTypeId, f.SecurityScopeId, f.EffectiveSecurityLevelId });
    builder.HasIndex(f => new { f.CurrentHolderUserId, f.PermissionLevelId, f.IsHeldInHand });

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

    builder.HasOne(f => f.FileType)
           .WithMany(ft => ft.ProtectedFiles)
           .HasForeignKey(f => f.FileTypeId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(f => f.CurrentHolderUser)
           .WithMany()
           .HasForeignKey(f => f.CurrentHolderUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(f => f.SecurityScope)
           .WithMany(s => s.ProtectedFiles)
           .HasForeignKey(f => f.SecurityScopeId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.InstanceSecurityLevel)
           .WithMany(l => l.InstanceProtectedFiles)
           .HasForeignKey(f => f.InstanceSecurityLevelId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.EffectiveSecurityLevel)
           .WithMany(l => l.EffectiveProtectedFiles)
           .HasForeignKey(f => f.EffectiveSecurityLevelId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.PermissionLevel)
           .WithMany(p => p.ProtectedFiles)
           .HasForeignKey(f => f.PermissionLevelId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(f => f.EncryptionState)
           .WithMany(e => e.ProtectedFiles)
           .HasForeignKey(f => f.EncryptionStateId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
