using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class CorporationDomainRecordConfiguration : IEntityTypeConfiguration<CorporationDomainRecord>
{
  public void Configure(EntityTypeBuilder<CorporationDomainRecord> builder)
  {
    builder.ToTable("mpx_corporation_domain_records");
    builder.HasKey(b => b.Id);
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.CorporationDomainId).IsRequired();
    builder.Property(b => b.RecordType).IsRequired().HasMaxLength(20).HasDefaultValue("CNAME");
    builder.Property(b => b.HostName).IsRequired().HasMaxLength(150);
    builder.Property(b => b.Value).IsRequired().HasMaxLength(500);
    builder.Property(b => b.Ttl).IsRequired().HasDefaultValue(3600);
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.HasIndex(b => b.Key).IsUnique();
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Description).IsRequired(false).HasMaxLength(120);

    builder.HasOne(b => b.Corporation)
           .WithMany(c => c.CorporationDomainRecords)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.CorporationDomain)
           .WithMany(d => d.DomainRecords)
           .HasForeignKey(b => b.CorporationDomainId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}

