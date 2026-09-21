using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;

namespace Morphus.Context;

public class W3DbContext(DbContextOptions<W3DbContext> options) : DbContext(options)
{
  protected override void OnModelCreating(ModelBuilder builder)
  {
    base.OnModelCreating(builder);

    builder.ApplyConfigurationsFromAssembly(typeof(W3DbContext).Assembly);
  }

  public DbSet<Business> Business { get; set; }
  public DbSet<BusinessUser> BusinessUser { get; set; }
  public DbSet<Claim> Claim { get; set; }
  public DbSet<Module> Module { get; set; }
  public DbSet<RoleClaim> RoleClaim { get; set; }
  public DbSet<Role> Role { get; set; }
  public DbSet<SubModule> SubModule { get; set; }
  public DbSet<UserClaim> UserClaim { get; set; }
  public DbSet<User> User { get; set; }
  public DbSet<UserRole> UserRole { get; set; }
  public DbSet<UserStatus> UserStatus { get; set; }
  public DbSet<Email> Email { get; set; }
  public DbSet<EmailTo> EmaislTo { get; set; }
  public DbSet<EmailFrom> EmailsFrom { get; set; }
  public DbSet<EmailCc> EmailsCc { get; set; }
  public DbSet<EmailBcc> EmailsBcc { get; set; }
}
