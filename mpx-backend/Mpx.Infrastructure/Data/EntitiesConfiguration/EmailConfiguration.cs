using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class EmailConfiguration : IEntityTypeConfiguration<Email>
{
  public void Configure(EntityTypeBuilder<Email> builder)
  {
    builder.HasKey(e => e.Id);

    builder.Property(e => e.Subject).HasMaxLength(250);
    builder.Property(e => e.HtmlBody);
    builder.Property(e => e.TextBody);
    builder.Property(e => e.CorporationId).IsRequired();

    builder.HasOne(e => e.Corporation)
           .WithMany(c => c.Emails)
           .HasForeignKey(e => e.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    // MAPEAMENTO DOS FILHOS USANDO A NAVEGAÇÃO INTERNA DO EF CORE (Garante o varchar(150))
    // 1. Relacionamento e campos da tabela EmailTo
    builder.HasMany(e => e.EmailTo)
           .WithOne(t => t.Email)
           .HasForeignKey(t => t.EmailId)
           .OnDelete(DeleteBehavior.Cascade);

    // 2. Relacionamento e campos da tabela EmailFrom
    builder.HasMany(e => e.EmailFrom)
           .WithOne(f => f.Email)
           .HasForeignKey(f => f.EmailId)
           .OnDelete(DeleteBehavior.Cascade);

    // 3. Relacionamento e campos da tabela EmailCc
    builder.HasMany(e => e.EmailCc)
           .WithOne(c => c.Email)
           .HasForeignKey(c => c.EmailId)
           .OnDelete(DeleteBehavior.Cascade);

    // 4. Relacionamento e campos da tabela EmailBcc
    builder.HasMany(e => e.EmailBcc)
           .WithOne(b => b.Email)
           .HasForeignKey(b => b.EmailId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
