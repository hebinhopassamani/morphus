using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class MailBCCConfiguration : IEntityTypeConfiguration<EmailBcc>
{
  public void Configure(EntityTypeBuilder<EmailBcc> builder)
  {
    builder.ToTable("EmailsBcc");
    builder.HasKey(eb => eb.Id);

    builder.Property(eb => eb.EmailId).IsRequired(true).HasColumnType("uuid");
    builder.Property(eb => eb.Mail).IsRequired(true).HasMaxLength(100);
    builder.Property(eb => eb.Name).IsRequired(false).HasMaxLength(100);

    builder.HasOne(eb => eb.Email)
           .WithMany(e => e.EmailsBcc)
           .HasForeignKey(e => e.EmailId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
