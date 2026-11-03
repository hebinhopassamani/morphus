using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class CorporationConfiguration : IEntityTypeConfiguration<Corporation>
{
  public void Configure(EntityTypeBuilder<Corporation> builder)
  {
    builder.HasKey(b => b.Id);
    builder.Property(b => b.Name).IsRequired().HasMaxLength(150);
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.Property(b => b.Email).IsRequired().HasMaxLength(150);
    builder.Property(b => b.PersonType).IsRequired().HasMaxLength(2).HasDefaultValue("PJ");
    builder.Property(b => b.CpfCnpj).IsRequired(false).HasMaxLength(14);
    builder.Property(b => b.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(b => b.ParentCorporation)
           .WithMany(b => b.Corporations)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
