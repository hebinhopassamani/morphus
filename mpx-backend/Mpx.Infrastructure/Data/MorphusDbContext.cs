using Microsoft.EntityFrameworkCore;
using Morphus.Infrastructure.Data;
using mpx.Domain.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Infrastructure.Interfaces;

namespace Mpx.Infrastructure.Data;

public class MorphusDbContext(DbContextOptions<MorphusDbContext> options, ITenantProvider tenantProvider) : DbContext(options), IUnitOfWork
{
  public Guid CurrentCorporationId => tenantProvider.GetCorporationId();

  protected override void OnModelCreating(ModelBuilder builder)
  {
    base.OnModelCreating(builder);
    builder.ApplyConfigurationsFromAssembly(typeof(MorphusDbContext).Assembly);

    foreach (var entityType in builder.Model.GetEntityTypes())
    {
      if (typeof(MorphusEntity).IsAssignableFrom(entityType.ClrType))
      {
        builder.Entity(entityType.ClrType)
            .Property(nameof(MorphusEntity.Key))
            .IsRequired()
            .HasMaxLength(100)
            .HasDefaultValue(string.Empty);

        builder.Entity(entityType.ClrType)
            .HasIndex(nameof(MorphusEntity.Key))
            .IsUnique();

        builder.Entity(entityType.ClrType)
            .Property(nameof(MorphusEntity.System))
            .IsRequired()
            .HasDefaultValue(false);

        builder.Entity(entityType.ClrType)
            .Property(nameof(MorphusEntity.Inactive))
            .IsRequired()
            .HasDefaultValue(false);
      }
      else if (typeof(MorphusRelatedEntity).IsAssignableFrom(entityType.ClrType))
      {
        builder.Entity(entityType.ClrType)
            .Property(nameof(MorphusRelatedEntity.System))
            .IsRequired()
            .HasDefaultValue(false);

        builder.Entity(entityType.ClrType)
            .Property(nameof(MorphusRelatedEntity.Inactive))
            .IsRequired()
            .HasDefaultValue(false);
      }

      if (typeof(IMorphusTenant).IsAssignableFrom(entityType.ClrType))
      {
        builder.Entity(entityType.ClrType)
            .HasQueryFilter(ConvertFilterExpression(entityType.ClrType));
      }
    }

    builder.Entity<User>()
        .HasQueryFilter(u =>
            u.CorporationId == CurrentCorporationId ||
            u.CorporationUsers.Any(cu => cu.CorporationId == CurrentCorporationId));
  }

  private System.Linq.Expressions.LambdaExpression ConvertFilterExpression(Type type)
  {
    var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");
    var property = System.Linq.Expressions.Expression.Property(parameter, nameof(IMorphusTenant.CorporationId));

    var contextProperty = System.Linq.Expressions.Expression.Property(
        System.Linq.Expressions.Expression.Constant(this),
        nameof(CurrentCorporationId)
    );

    var condition = System.Linq.Expressions.Expression.Equal(property, contextProperty);

    return System.Linq.Expressions.Expression.Lambda(condition, parameter);
  }

  public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    var addedEntityEntries = ChangeTracker.Entries<MorphusEntity>()
        .Where(e => e.State == EntityState.Added && string.IsNullOrWhiteSpace(e.Entity.Key))
        .ToList();

    foreach (var entry in addedEntityEntries)
    {
      entry.Entity.Key = MorphusEntity.GenerateKey();
    }

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

    var addedCompletedUserEntries = ChangeTracker.Entries<User>()
        .Where(e => e.State == EntityState.Added &&
                    e.Entity.OnboardingCompleted &&
                    (e.Entity.CorporationId is null || e.Entity.CorporationId == Guid.Empty))
        .ToList();

    if (addedCompletedUserEntries.Count > 0)
    {
      try
      {
        var currentCorporationId = tenantProvider.GetCorporationId();
        foreach (var entry in addedCompletedUserEntries)
        {
          entry.Entity.CorporationId = currentCorporationId;
        }
      }
      catch (UnauthorizedAccessException)
      {
        // Ignora caso não haja sessão com corporação ativa no contexto
      }
    }

    return base.SaveChangesAsync(cancellationToken);
  }

  public DbSet<Corporation> Corporations { get; set; }
  public DbSet<CorporationUser> CorporationUsers { get; set; }
  public DbSet<Workspace> Workspaces { get; set; }
  public DbSet<WorkspaceUser> WorkspaceUsers { get; set; }
  public DbSet<WorkspaceApplication> WorkspaceApplications { get; set; }
  public DbSet<MorphusApplication> Applications { get; set; }
  public DbSet<Category> Categories { get; set; }
  public DbSet<ApplicationStatus> ApplicationStatuses { get; set; }
  public DbSet<ApplicationModule> ApplicationModules { get; set; }
  public DbSet<ApplicationSubModule> ApplicationSubModules { get; set; }
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

  public DbSet<Feature> Features { get; set; }
  public DbSet<FeatureHighlight> FeatureHighlights { get; set; }
  public DbSet<ModuleCategory> ModuleCategories { get; set; }
  public DbSet<ShowcaseModule> ShowcaseModules { get; set; }

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
