using Microsoft.EntityFrameworkCore;
using Morphus.Infrastructure.Data;
using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Infrastructure.Interfaces;

namespace Mpx.Infrastructure.Data;

public class MorphusDbContext(DbContextOptions<MorphusDbContext> options, ITenantProvider tenantProvider) : DbContext(options), IUnitOfWork
{
  protected override void OnModelCreating(ModelBuilder builder)
  {
    base.OnModelCreating(builder);
    builder.ApplyConfigurationsFromAssembly(typeof(MorphusDbContext).Assembly);

    foreach (var entityType in builder.Model.GetEntityTypes())
    {
      if (typeof(IMorphusTenant).IsAssignableFrom(entityType.ClrType))
      {
        builder.Entity(entityType.ClrType)
            .HasQueryFilter(ConvertFilterExpression(entityType.ClrType));
      }
    }
  }

  private System.Linq.Expressions.LambdaExpression ConvertFilterExpression(Type type)
  {
    var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");
    var property = System.Linq.Expressions.Expression.Property(parameter, nameof(IMorphusTenant.CorporationId));

    var providerExpression = System.Linq.Expressions.Expression.Call(
        System.Linq.Expressions.Expression.Constant(tenantProvider),
        typeof(ITenantProvider).GetMethod(nameof(ITenantProvider.GetCorporationId))!
    );

    var condition = System.Linq.Expressions.Expression.Equal(property, providerExpression);

    return System.Linq.Expressions.Expression.Lambda(condition, parameter);
  }

  public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    var addedTenantEntries = ChangeTracker.Entries<IMorphusTenant>()
        .Where(e => e.State == EntityState.Added && e.Entity.CorporationId == Guid.Empty)
        .ToList();

    if (addedTenantEntries.Count > 0)
    {
      var currentCorporationId = tenantProvider.GetCorporationId();

      foreach (var entry in addedTenantEntries)
      {
        entry.Entity.CorporationId = currentCorporationId;
      }
    }

    return base.SaveChangesAsync(cancellationToken);
  }

  public DbSet<Corporation> Corporations { get; set; }
  public DbSet<CorporationUser> CorporationUsers { get; set; }
  public DbSet<Workspace> Workspaces { get; set; }
  public DbSet<WorkspaceUser> WorkspaceUsers { get; set; }
  public DbSet<MorphusApplication> Applications { get; set; }
  public DbSet<ApplicationUser> ApplicationUsers { get; set; }
  public DbSet<Menu> Menus { get; set; }
  public DbSet<Module> Modules { get; set; }
  public DbSet<SubModule> SubModules { get; set; }
  public DbSet<Role> Roles { get; set; }
  public DbSet<Claim> Claims { get; set; }
  public DbSet<RoleClaim> RoleClaims { get; set; }
  public DbSet<UserRole> UserRoles { get; set; }
  public DbSet<UserClaim> UserClaims { get; set; }
  public DbSet<User> Users { get; set; }
  public DbSet<UserStatus> UserStatus { get; set; }

  public DbSet<Email> Emails { get; set; }
  public DbSet<EmailTo> EmailsTo { get; set; }
  public DbSet<EmailFrom> EmailsFrom { get; set; }
  public DbSet<EmailCc> EmailsCc { get; set; }
  public DbSet<EmailBcc> EmailsBcc { get; set; }

  public async Task<IMorphusTransaction> BeginTransactionAsync()
  {
    var efTransaction = await Database.BeginTransactionAsync();
    return new MorphusTransaction(this, efTransaction);
  }

  public async Task<int> SaveChangesAsync()
  {
    return await SaveChangesAsync(CancellationToken.None);
  }
}
