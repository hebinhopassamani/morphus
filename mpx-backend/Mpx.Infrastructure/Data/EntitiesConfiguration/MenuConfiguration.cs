using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MenuConfiguration : IEntityTypeConfiguration<Menu>
{
  public void Configure(EntityTypeBuilder<Menu> builder)
  {
    builder.ToTable("mpx_menus");
    builder.HasKey(b => b.Id);
    builder.Property(b => b.Label).IsRequired().HasMaxLength(150);
    builder.Property(b => b.ApplicationId).IsRequired();
    builder.Property(b => b.ModuleId).IsRequired(false);
    builder.Property(b => b.SubModuleId).IsRequired(false);
    builder.Property(b => b.Order).IsRequired().HasDefaultValue(0);
    builder.Property(b => b.Url).IsRequired(false).HasMaxLength(250);
    builder.Property(b => b.Icon).IsRequired(false).HasMaxLength(100);
    builder.Property(b => b.System).IsRequired().HasDefaultValue(false);
    builder.Property(b => b.CorporationId).IsRequired();
    builder.Property(b => b.Description).IsRequired(false).HasColumnType("text");

    builder.HasOne(b => b.Application)
           .WithMany(a => a.Menus)
           .HasForeignKey(b => b.ApplicationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.Module)
           .WithMany()
           .HasForeignKey(b => b.ModuleId)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(b => b.SubModule)
           .WithMany()
           .HasForeignKey(b => b.SubModuleId)
           .OnDelete(DeleteBehavior.SetNull);

    builder.HasOne(b => b.Corporation)
           .WithMany(b => b.Menus)
           .HasForeignKey(b => b.CorporationId)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(b => b.ParentMenu)
           .WithMany(b => b.SubMenus)
           .HasForeignKey(b => b.MenuId)
           .OnDelete(DeleteBehavior.Restrict);
  }
}
