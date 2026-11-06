using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class WorkspaceConfiguration : IEntityTypeConfiguration<Workspace>
{
  public void Configure(EntityTypeBuilder<Workspace> builder)
  {
    builder.ToTable("mpx_workspaces");

    builder.HasKey(w => w.Id);
    builder.Property(w => w.Name).IsRequired().HasMaxLength(150);
    builder.Property(w => w.Key).IsRequired().HasMaxLength(100);
    builder.Property(w => w.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(w => w.Color).IsRequired(false).HasMaxLength(50);
    builder.Property(w => w.Default).IsRequired().HasDefaultValue(false);
    builder.Property(w => w.System).IsRequired().HasDefaultValue(false);
    builder.Property(w => w.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(w => w.CorporationId).IsRequired();
    builder.Property(w => w.Description).IsRequired(false).HasMaxLength(120);

    builder.HasIndex(w => w.CorporationId)
           .IsUnique()
           .HasFilter("\"default\" = true");

    builder.HasOne(w => w.Corporation)
           .WithMany(c => c.Workspaces)
           .HasForeignKey(w => w.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
