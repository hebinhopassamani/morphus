using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxCorporationDomainConfiguration : IEntityTypeConfiguration<MpxCorporationDomain>
{
  public void Configure(EntityTypeBuilder<MpxCorporationDomain> builder)
  {
    builder.ToTable("mpx_corporation_domains");
    builder.HasKey(b => b.Id);
    builder.Property(b => b.DomainName).IsRequired().HasMaxLength(150);
    builder.Property(b => b.OriginType).IsRequired().HasMaxLength(40).HasDefaultValue("CustomerOwned");
    builder.Property(b => b.VerificationStatus).IsRequired().HasMaxLength(40).HasDefaultValue("PendingVerification");
    builder.Property(b => b.VerificationToken).IsRequired(false).HasMaxLength(120);
    builder.Property(b => b.IsPrimary).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.Key).IsRequired().HasMaxLength(100);
    builder.HasIndex(b => b.Key).IsUnique();
    builder.HasIndex(b => b.DomainName).IsUnique();
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Inactive).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.Description).IsRequired(false).HasMaxLength(120);

    builder.HasOne(b => b.Corporation)
           .WithMany(c => c.CorporationDomains)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}

