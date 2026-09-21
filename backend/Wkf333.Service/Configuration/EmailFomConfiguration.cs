using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Entities;

namespace Morphus.Configurations;

public class MailFromConfiguration : IEntityTypeConfiguration<EmailFrom>
{
  public void Configure(EntityTypeBuilder<EmailFrom> builder)
  {
    builder.ToTable("EmailsFrom");
    builder.HasKey(k => k.Id);

    builder.Property(p => p.Mail).IsRequired(true).HasMaxLength(50);
    builder.Property(p => p.Name).IsRequired(false).HasMaxLength(50);

    builder.HasOne(e => e.Email)
           .WithMany(e => e.EmailsFrom)
           .HasForeignKey(c => c.EmailId);
  }
}
