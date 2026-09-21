using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Entities;

namespace Morphus.Configurations;

public class MailBCCConfiguration : IEntityTypeConfiguration<EmailBcc>
{
  public void Configure(EntityTypeBuilder<EmailBcc> builder)
  {
    builder.ToTable("EmailsBcc");
    builder.HasKey(k => k.Id);

    builder.Property(p => p.Mail).IsRequired(true).HasMaxLength(50);
    builder.Property(p => p.Name).IsRequired(false).HasMaxLength(50);

    builder.HasOne(e => e.Email)
           .WithMany(e => e.EmailsBcc)
           .HasForeignKey(c => c.EmailId);
  }
}
