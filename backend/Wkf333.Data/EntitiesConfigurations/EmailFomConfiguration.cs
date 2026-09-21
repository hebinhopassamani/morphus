using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class MailFromConfiguration : IEntityTypeConfiguration<EmailFrom>
{
  public void Configure(EntityTypeBuilder<EmailFrom> builder)
  {
    builder.ToTable("EmailsFrom");
    builder.HasKey(ef => ef.Id);

    builder.Property(ef => ef.EmailId).IsRequired(true).HasColumnType("uuid");
    builder.Property(ef => ef.Mail).IsRequired(true).HasMaxLength(100);
    builder.Property(ef => ef.Name).IsRequired(false).HasMaxLength(100);

    builder.HasOne(ef => ef.Email)
           .WithMany(e => e.EmailsFrom)
           .HasForeignKey(e => e.EmailId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
