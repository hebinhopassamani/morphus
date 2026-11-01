using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ApplicationConfiguration : IEntityTypeConfiguration<MorphusApplication>
{
  public void Configure(EntityTypeBuilder<MorphusApplication> builder)
  {
    builder.ToTable("applications");

    builder.HasKey(a => a.Id);
    builder.Property(a => a.Name).IsRequired().HasMaxLength(150);
    builder.Property(a => a.Key).IsRequired().HasMaxLength(100);
    builder.Property(a => a.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(a => a.System).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(a => a.WorkspaceId).IsRequired();
    builder.Property(a => a.CorporationId).IsRequired();
    builder.Property(a => a.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(a => a.Workspace)
           .WithMany(w => w.Applications)
           .HasForeignKey(a => a.WorkspaceId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(a => a.Corporation)
           .WithMany(c => c.Applications)
           .HasForeignKey(a => a.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
