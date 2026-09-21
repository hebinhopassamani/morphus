using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Entities;

namespace Morphus.Configurations;

public class EmailConfiguration : IEntityTypeConfiguration<Email>
{
  public void Configure(EntityTypeBuilder<Email> builder)
  {
    builder.ToTable("Email");
    builder.HasKey(k => k.Id);

    builder.Property(p => p.Subject).IsRequired(true).HasMaxLength(50);
    builder.Property(p => p.HtmlBody).IsRequired(false).HasColumnType("Text");
    builder.Property(p => p.TextBody).IsRequired(false).HasColumnType("Text");
    builder.Property(p => p.IsHtmlBody).IsRequired(true).HasDefaultValue(false);
    builder.Property(p => p.MailSent).IsRequired(true).HasDefaultValue(false);
  }
}
