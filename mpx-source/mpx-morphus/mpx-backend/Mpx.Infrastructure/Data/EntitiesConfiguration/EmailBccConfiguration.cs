using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class EmailBccConfiguration : IEntityTypeConfiguration<EmailBcc>
{
  public void Configure(EntityTypeBuilder<EmailBcc> builder)
  {
    builder.HasKey(t => t.Id);
    builder.Property(t => t.Mail).HasMaxLength(150).IsRequired();
    builder.Property(t => t.Name).HasMaxLength(100);
    builder.Property(t => t.CorporationId).IsRequired();

    builder.HasOne(t => t.Corporation)
           .WithMany(c => c.EmailsBcc)
           .HasForeignKey(t => t.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
