using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Entities;

namespace Morphus.Configurations;

public class MailToConfiguration : IEntityTypeConfiguration<EmailTo>
{
  public void Configure(EntityTypeBuilder<EmailTo> builder)
  {
    builder.ToTable("EmaislTo");
    builder.HasKey(k => k.Id);

    builder.Property(p => p.Mail).IsRequired(true).HasMaxLength(50);
    builder.Property(p => p.Name).IsRequired(false).HasMaxLength(50);

    builder.HasOne(e => e.Email)
           .WithMany(e => e.EmaislTo)
           .HasForeignKey(c => c.EmailId);
  }
}
