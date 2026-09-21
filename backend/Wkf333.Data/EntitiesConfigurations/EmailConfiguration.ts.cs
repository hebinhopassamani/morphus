using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class EmailConfiguration : IEntityTypeConfiguration<Email>
{
  public void Configure(EntityTypeBuilder<Email> builder)
  {
    builder.ToTable("Email");
    builder.HasKey(e => e.Id);

    builder.Property(e => e.Subject).IsRequired(true).HasMaxLength(100);
    builder.Property(e => e.HtmlBody).IsRequired(false).HasColumnType("Text");
    builder.Property(e => e.TextBody).IsRequired(false).HasColumnType("Text");
    builder.Property(e => e.IsHtmlBody).IsRequired(true).HasDefaultValue(false);
    builder.Property(e => e.MailSent).IsRequired(true).HasDefaultValue(false);
  }
}
