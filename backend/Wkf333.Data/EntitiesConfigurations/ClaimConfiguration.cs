using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class ClaimConfiguration : IEntityTypeConfiguration<Claim>
{
  public void Configure(EntityTypeBuilder<Claim> builder)
  {
    builder.ToTable("Claim");
    builder.HasKey(c => c.Id);

    builder.Property(c => c.ClaimType).IsRequired(true).HasMaxLength(20);
    builder.Property(c => c.ClaimValue).IsRequired(true).HasMaxLength(20);
    builder.Property(c => c.System).IsRequired(true).HasDefaultValue(false);
    builder.Property(c => c.BusinessId).IsRequired(true).HasColumnType("uuid");
    builder.Property(c => c.ModuleId).IsRequired(true).HasColumnType("uuid");
    builder.Property(c => c.SubModuleId).IsRequired(true).HasColumnType("uuid");
    builder.Property(c => c.Description).IsRequired(false).HasColumnType("Text");
    builder.Property(c => c.ConcurrencyStamp).IsRequired(false).HasMaxLength(200);

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
