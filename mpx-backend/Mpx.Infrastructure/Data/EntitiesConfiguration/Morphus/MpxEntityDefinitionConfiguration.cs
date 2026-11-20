using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxEntityDefinitionConfiguration : IEntityTypeConfiguration<MpxEntityDefinition>
{
  public void Configure(EntityTypeBuilder<MpxEntityDefinition> builder)
  {
    builder.ToTable("mpx_entities");
    builder.HasKey(e => e.Id);

    builder.Property(e => e.CorporationId).IsRequired(false);
    builder.Property(e => e.ApplicationId).IsRequired(false);
    builder.Property(e => e.Name).IsRequired().HasMaxLength(120);
    builder.Property(e => e.TableName).IsRequired().HasMaxLength(120);
    builder.Property(e => e.Label).IsRequired().HasMaxLength(150);
    builder.Property(e => e.PluralLabel).IsRequired(false).HasMaxLength(150);
    builder.Property(e => e.ModuleName).IsRequired().HasMaxLength(80).HasDefaultValue("Morphus");
    builder.Property(e => e.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(e => e.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(e => new { e.CorporationId, e.Name });

    builder.HasOne(e => e.Corporation)
           .WithMany()
           .HasForeignKey(e => e.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(e => e.Application)
           .WithMany()
           .HasForeignKey(e => e.ApplicationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
