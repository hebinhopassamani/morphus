using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Entities;

namespace Morphus.Configurations;

public class MailCCConfiguration : IEntityTypeConfiguration<EmailCc>
{
  public void Configure(EntityTypeBuilder<EmailCc> builder)
  {
    builder.ToTable("EmailsCc");
    builder.HasKey(k => k.Id);

    builder.Property(p => p.Mail).IsRequired(true).HasMaxLength(50);
    builder.Property(p => p.Name).IsRequired(false).HasMaxLength(50);

    builder.HasOne(e => e.Email)
           .WithMany(e => e.EmailsCc)
           .HasForeignKey(c => c.EmailId);
  }
}
