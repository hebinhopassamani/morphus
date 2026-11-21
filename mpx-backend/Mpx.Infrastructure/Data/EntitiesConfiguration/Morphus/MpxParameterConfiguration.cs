using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxParameterConfiguration : IEntityTypeConfiguration<MpxParameter>
{
  public void Configure(EntityTypeBuilder<MpxParameter> builder)
  {
    builder.ToTable("mpx_parameters");
    builder.HasKey(p => p.Id);

    builder.Property(p => p.CorporationId).IsRequired(false);
    builder.Property(p => p.ScopeId).IsRequired();
    builder.Property(p => p.ScopeCode).IsRequired().HasConversion<short>().HasDefaultValue(MpxParameterScopeEnum.SystemDefault);
    builder.Property(p => p.WorkspaceId).IsRequired(false);
    builder.Property(p => p.ApplicationId).IsRequired(false);
    builder.Property(p => p.UserId).IsRequired(false);
    builder.Property(p => p.MachineKey).IsRequired(false).HasMaxLength(120);
    builder.Property(p => p.Namespace).IsRequired().HasMaxLength(100);
    builder.Property(p => p.Name).IsRequired().HasMaxLength(150);
    builder.Property(p => p.SettingsJson).IsRequired().HasColumnType("text");
    builder.Property(p => p.IsLockedBySovereign).IsRequired().HasDefaultValue(false);
    builder.Property(p => p.IsExportable).IsRequired().HasDefaultValue(true);
    builder.Property(p => p.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(p => new { p.CorporationId, p.ScopeCode, p.Namespace });

    builder.HasOne(p => p.Corporation)
           .WithMany()
           .HasForeignKey(p => p.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(p => p.Scope)
           .WithMany(s => s.Parameters)
           .HasForeignKey(p => p.ScopeId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(p => p.Workspace)
           .WithMany()
           .HasForeignKey(p => p.WorkspaceId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(p => p.Application)
           .WithMany()
           .HasForeignKey(p => p.ApplicationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(p => p.User)
           .WithMany()
           .HasForeignKey(p => p.UserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
