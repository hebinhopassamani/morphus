using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using Mpx.Domain.Entities;

namespace Mpx.Infrastructure.Data.EntitiesConfiguration;

public class MpxUserNotificationConfiguration : IEntityTypeConfiguration<MpxUserNotification>
{
  public void Configure(EntityTypeBuilder<MpxUserNotification> builder)
  {
    builder.ToTable("mpx_user_notifications");
    builder.HasKey(un => un.Id);

    builder.Property(un => un.CorporationId).IsRequired(false);
    builder.Property(un => un.NotificationId).IsRequired();
    builder.Property(un => un.UserId).IsRequired();
    builder.Property(un => un.Read).IsRequired().HasDefaultValue(false);
    builder.Property(un => un.ReadAtUtc).IsRequired(false);
    builder.Property(un => un.Acknowledged).IsRequired().HasDefaultValue(false);
    builder.Property(un => un.AcknowledgedAtUtc).IsRequired(false);
    builder.Property(un => un.Dismissed).IsRequired().HasDefaultValue(false);
    builder.Property(un => un.DismissedAtUtc).IsRequired(false);
    builder.Property(un => un.Pinned).IsRequired().HasDefaultValue(false);
    builder.Property(un => un.DeliveredInApp).IsRequired().HasDefaultValue(true);
    builder.Property(un => un.DeliveredViaEmail).IsRequired().HasDefaultValue(false);
    builder.Property(un => un.CreatedAtUtc).IsRequired();
    builder.Property(un => un.Description).IsRequired(false).HasMaxLength(300);

    builder.HasIndex(un => new { un.NotificationId, un.UserId }).IsUnique();
    builder.HasIndex(un => new { un.UserId, un.Read, un.Dismissed, un.CreatedAtUtc });

    builder.HasOne(un => un.Corporation)
           .WithMany()
           .HasForeignKey(un => un.CorporationId)
           .IsRequired(false)
           .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(un => un.Notification)
           .WithMany(n => n.UserNotifications)
           .HasForeignKey(un => un.NotificationId)
           .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(un => un.User)
           .WithMany()
           .HasForeignKey(un => un.UserId)
           .OnDelete(DeleteBehavior.Cascade);
  }
}
