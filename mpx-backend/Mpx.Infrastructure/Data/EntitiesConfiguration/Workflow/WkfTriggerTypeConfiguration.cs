using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WkfTriggerTypeConfiguration : IEntityTypeConfiguration<WkfTriggerType>
{
  public void Configure(EntityTypeBuilder<WkfTriggerType> builder)
  {
    builder.ToTable("wkf_trigger_types");
    builder.HasKey(t => t.Id);

    builder.Property(t => t.CorporationId).IsRequired(false);
    builder.Property(t => t.Code).IsRequired().HasConversion<short>().HasDefaultValue(WkfTriggerTypeEnum.HtmlAction);
    builder.Property(t => t.Name).IsRequired().HasMaxLength(120);
    builder.Property(t => t.Label).IsRequired().HasMaxLength(150);
    builder.Property(t => t.RequiresRoute).IsRequired().HasDefaultValue(false);
    builder.Property(t => t.RequiresSchedule).IsRequired().HasDefaultValue(false);
    builder.Property(t => t.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(t => t.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(t => t.Order).IsRequired().HasDefaultValue(0);
    builder.Property(t => t.Description).IsRequired(false).HasColumnType("text");

    builder.HasIndex(t => new { t.CorporationId, t.Code }).IsUnique();

    builder.HasOne(t => t.Corporation)
           .WithMany()
           .HasForeignKey(t => t.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
