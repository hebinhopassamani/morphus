using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class RlyEmailToConfiguration : IEntityTypeConfiguration<RlyEmailTo>
{
  public void Configure(EntityTypeBuilder<RlyEmailTo> builder)
  {
    builder.ToTable("mpx_emails_to");
    builder.HasKey(t => t.Id);
    builder.Property(t => t.Mail).HasMaxLength(150).IsRequired();
    builder.Property(t => t.Name).HasMaxLength(100);
    builder.Property(t => t.CorporationId).IsRequired();

    builder.HasOne(t => t.Corporation)
           .WithMany(c => c.EmailsTo)
           .HasForeignKey(t => t.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}

