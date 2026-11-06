using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class ClaimConfiguration : IEntityTypeConfiguration<Claim>
{
  public void Configure(EntityTypeBuilder<Claim> builder)
  {
    builder.ToTable("sec_claims");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.ClaimType).IsRequired().HasMaxLength(50);
    builder.Property(c => c.ClaimValue).IsRequired().HasMaxLength(50);
    builder.Property(c => c.System).IsRequired().HasDefaultValue(false);
    builder.Property(c => c.CorporationId).IsRequired();
    builder.Property(c => c.ModuleId).IsRequired();
    builder.Property(c => c.SubModuleId).IsRequired();
    builder.Property(c => c.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(c => c.Corporation)
           .WithMany(b => b.Claims)
           .HasForeignKey(c => c.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(c => c.Module)
           .WithMany(m => m.Claims)
           .HasForeignKey(c => c.ModuleId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(c => c.SubModule)
           .WithMany(s => s.Claims)
           .HasForeignKey(c => c.SubModuleId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}

