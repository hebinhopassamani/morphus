using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Morphus.Domain.Entities.Models;

namespace Morphus.Data.EntitiesConfigurations;

public class MailToConfiguration : IEntityTypeConfiguration<EmailTo>
{
  public void Configure(EntityTypeBuilder<EmailTo> builder)
  {
    builder.ToTable("EmaislTo");
    builder.HasKey(et => et.Id);

    builder.Property(et => et.EmailId).IsRequired(true).HasColumnType("uuid");
    builder.Property(et => et.Mail).IsRequired(true).HasMaxLength(100);
    builder.Property(et => et.Name).IsRequired(false).HasMaxLength(100);

    builder.HasOne(et => et.Email)
           .WithMany(e => e.EmaislTo)
           .HasForeignKey(e => e.EmailId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
