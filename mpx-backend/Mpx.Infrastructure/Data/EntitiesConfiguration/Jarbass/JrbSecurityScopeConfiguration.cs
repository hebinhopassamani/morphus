using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;
using Mpx.Domain.Enums;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class JrbSecurityScopeConfiguration : IEntityTypeConfiguration<JrbSecurityScope>
{
  public void Configure(EntityTypeBuilder<JrbSecurityScope> builder)
  {
    builder.ToTable("jrb_security_scopes");
    builder.HasKey(s => s.Id);

    builder.Property(s => s.CorporationId).IsRequired(false);
    builder.Property(s => s.Code).IsRequired().HasConversion<short>().HasDefaultValue(JarbassSecurityScopeEnum.ByDocumentType);
    builder.Property(s => s.Label).IsRequired().HasMaxLength(120);
    builder.Property(s => s.ApplyToInstance).IsRequired().HasDefaultValue(false);
    builder.Property(s => s.Icon).IsRequired(false).HasMaxLength(80);
    builder.Property(s => s.Color).IsRequired(false).HasMaxLength(40);
    builder.Property(s => s.Order).IsRequired().HasDefaultValue(0);
    builder.Property(s => s.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(s => new { s.CorporationId, s.Code }).IsUnique();

    builder.HasOne(s => s.Corporation)
           .WithMany()
           .HasForeignKey(s => s.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
