using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbInsightConfiguration : IEntityTypeConfiguration<JrbInsight>
{
  public void Configure(EntityTypeBuilder<JrbInsight> builder)
  {
    builder.ToTable("jrb_insights");
    builder.HasKey(i => i.Id);

    builder.Property(i => i.CorporationId).IsRequired(false);
    builder.Property(i => i.JarbassAgentId).IsRequired(false);
    builder.Property(i => i.EntityDefinitionId).IsRequired(false);
    builder.Property(i => i.TargetEntityId).IsRequired(false);
    builder.Property(i => i.Category).IsRequired().HasMaxLength(60).HasDefaultValue("Prevention");
    builder.Property(i => i.Severity).IsRequired().HasMaxLength(30).HasDefaultValue("Info");
    builder.Property(i => i.Code).IsRequired().HasMaxLength(80);
    builder.Property(i => i.Title).IsRequired().HasMaxLength(200);
    builder.Property(i => i.Details).IsRequired().HasMaxLength(2000);
    builder.Property(i => i.AutoHealed).IsRequired().HasDefaultValue(false);
    builder.Property(i => i.AutoHealAction).IsRequired(false).HasMaxLength(500);
    builder.Property(i => i.OccurredAtUtc).IsRequired();
    builder.Property(i => i.Acknowledged).IsRequired().HasDefaultValue(false);
    builder.Property(i => i.AcknowledgedAtUtc).IsRequired(false);
    builder.Property(i => i.AcknowledgedByUserId).IsRequired(false);
    builder.Property(i => i.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(i => new { i.CorporationId, i.Acknowledged, i.OccurredAtUtc });

    builder.HasOne(i => i.Corporation)
           .WithMany()
           .HasForeignKey(i => i.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(i => i.JarbassAgent)
           .WithMany(a => a.Insights)
           .HasForeignKey(i => i.JarbassAgentId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(i => i.EntityDefinition)
           .WithMany()
           .HasForeignKey(i => i.EntityDefinitionId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(i => i.AcknowledgedByUser)
           .WithMany()
           .HasForeignKey(i => i.AcknowledgedByUserId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.SetNull);
  }
}
