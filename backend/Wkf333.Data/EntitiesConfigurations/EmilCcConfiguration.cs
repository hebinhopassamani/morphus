using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class MailCCConfiguration : IEntityTypeConfiguration<EmailCc>
{
  public void Configure(EntityTypeBuilder<EmailCc> builder)
  {
    builder.ToTable("EmailsCc");
    builder.HasKey(ec => ec.Id);

    builder.Property(ec => ec.EmailId).IsRequired(true).HasColumnType("uuid");
    builder.Property(ec => ec.Mail).IsRequired(true).HasMaxLength(100);
    builder.Property(ec => ec.Name).IsRequired(false).HasMaxLength(100);

    builder.HasOne(ec => ec.Email)
           .WithMany(e => e.EmailsCc)
           .HasForeignKey(e => e.EmailId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
