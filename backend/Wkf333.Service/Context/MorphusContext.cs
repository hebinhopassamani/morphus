using Microsoft.EntityFrameworkCore;
using Morphus.Entities;

namespace MyBackgroundWorker;

public class MorphusContext(DbContextOptions<MorphusContext> options) : DbContext(options)
{

  protected override void OnModelCreating(ModelBuilder builder)
  {
    base.OnModelCreating(builder);

    builder.ApplyConfigurationsFromAssembly(typeof(MorphusContext).Assembly);
  }

  public DbSet<Email> Email { get; set; }
  public DbSet<EmailTo> EmaislTo { get; set; }
  public DbSet<EmailFrom> EmailsFrom { get; set; }
  public DbSet<EmailCc> EmailsCc { get; set; }
  public DbSet<EmailBcc> EmailsBcc { get; set; }
}
