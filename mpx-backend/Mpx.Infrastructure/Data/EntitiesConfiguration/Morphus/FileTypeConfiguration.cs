using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class FileTypeConfiguration : IEntityTypeConfiguration<FileType>
{
  public void Configure(EntityTypeBuilder<FileType> builder)
  {
    builder.ToTable("mpx_file_types");
    builder.HasKey(f => f.Id);

    builder.Property(f => f.Name).IsRequired().HasMaxLength(120);
    builder.Property(f => f.Extension).IsRequired().HasMaxLength(20);
    builder.Property(f => f.MimeType).IsRequired().HasMaxLength(150);
    builder.Property(f => f.Category).IsRequired().HasMaxLength(60).HasDefaultValue("Document");
    builder.Property(f => f.MaxSizeInMb).IsRequired().HasDefaultValue(10);
    builder.Property(f => f.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(f => f.Description).IsRequired(false).HasColumnType("text");
    builder.Property(f => f.CorporationId).IsRequired();

    builder.HasOne(f => f.Corporation)
           .WithMany()
           .HasForeignKey(f => f.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
