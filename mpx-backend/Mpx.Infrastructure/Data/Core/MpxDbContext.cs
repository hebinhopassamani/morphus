using System.Linq.Expressions;

using Microsoft.EntityFrameworkCore;

using Mpx.Core.Entities;
using Mpx.Core.Interfaces;
using Mpx.Core.Security;
using Mpx.Domain.Entities;
using Mpx.Infrastructure.Interfaces;

namespace Mpx.Infrastructure.Data.Core;

public class MpxDbContext(DbContextOptions<MpxDbContext> options, ITenantProvider tenantProvider) : DbContext(options), IUnitOfWork
{
  public Guid CurrentCorporationId => tenantProvider.GetCorporationId();

  protected override void OnModelCreating(ModelBuilder builder)
  {
    base.OnModelCreating(builder);
    builder.ApplyConfigurationsFromAssembly(typeof(MpxDbContext).Assembly);

    foreach (var entityType in builder.Model.GetEntityTypes())
    {
      if (typeof(MpxEntity).IsAssignableFrom(entityType.ClrType))
      {
        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxEntity.Key))
            .IsRequired()
            .HasMaxLength(100)
            .HasDefaultValue(string.Empty);

        builder.Entity(entityType.ClrType)
            .HasIndex(nameof(MpxEntity.Key))
            .IsUnique();

        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxEntity.System))
            .IsRequired()
            .HasDefaultValue(false);

        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxEntity.Inactive))
            .IsRequired()
            .HasDefaultValue(false);

        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxEntity.CreatedAt))
            .IsRequired()
            .HasDefaultValueSql("now()");

        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxEntity.UpdatedAt))
            .IsRequired()
            .HasDefaultValueSql("now()");
      }
      else if (typeof(MpxRelatedEntity).IsAssignableFrom(entityType.ClrType))
      {
        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxRelatedEntity.System))
            .IsRequired()
            .HasDefaultValue(false);

        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxRelatedEntity.Inactive))
            .IsRequired()
            .HasDefaultValue(false);

        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxRelatedEntity.CreatedAt))
            .IsRequired()
            .HasDefaultValueSql("now()");

        builder.Entity(entityType.ClrType)
            .Property(nameof(MpxRelatedEntity.UpdatedAt))
            .IsRequired()
            .HasDefaultValueSql("now()");
      }

      if (typeof(IMpxTenant).IsAssignableFrom(entityType.ClrType))
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

  private LambdaExpression ConvertFilterExpression(Type type)
  {
    var parameter = Expression.Parameter(type, "e");
    var property = Expression.Property(parameter, nameof(IMpxTenant.CorporationId));

    var contextProperty = Expression.Property(
        Expression.Constant(this),
        nameof(CurrentCorporationId)
    );

    var condition = Expression.Equal(property, contextProperty);

    return Expression.Lambda(condition, parameter);
  }

  public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    var now = DateTime.UtcNow;

    foreach (var entry in ChangeTracker.Entries<MpxEntity>())
    {
      if (entry.State == EntityState.Added)
      {
        if (string.IsNullOrWhiteSpace(entry.Entity.Key))
        {
          entry.Entity.Key = MpxKey.Generate();
        }
        if (entry.Entity.CreatedAt == default)
        {
          entry.Entity.CreatedAt = now;
        }
        entry.Entity.UpdatedAt = now;
      }
      else if (entry.State == EntityState.Modified)
      {
        entry.Entity.UpdatedAt = now;
      }
    }

    foreach (var entry in ChangeTracker.Entries<MpxRelatedEntity>())
    {
      if (entry.State == EntityState.Added)
      {
        if (entry.Entity.CreatedAt == default)
        {
          entry.Entity.CreatedAt = now;
        }
        entry.Entity.UpdatedAt = now;
      }
      else if (entry.State == EntityState.Modified)
      {
        entry.Entity.UpdatedAt = now;
      }
    }

    var addedTenantEntries = ChangeTracker.Entries<IMpxTenant>()
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
  public DbSet<Application> Applications { get; set; }
  public DbSet<Category> Categories { get; set; }
  public DbSet<ApplicationStatus> ApplicationStatuses { get; set; }
  public DbSet<ApplicationModule> ApplicationModules { get; set; }
  public DbSet<ApplicationSubModule> ApplicationSubModules { get; set; }
  public DbSet<ApplicationSetting> ApplicationSettings { get; set; }
  public DbSet<CorporationDomain> CorporationDomains { get; set; }
  public DbSet<CorporationDomainRecord> CorporationDomainRecords { get; set; }
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

  public DbSet<EntityDefinition> EntityDefinitions { get; set; }
  public DbSet<EntityProperty> EntityProperties { get; set; }
  public DbSet<FileType> FileTypes { get; set; }
  public DbSet<Station> Stations { get; set; }
  public DbSet<WorkflowType> WorkflowTypes { get; set; }
  public DbSet<WorkflowTypeContext> WorkflowTypeContexts { get; set; }
  public DbSet<WorkflowTypeConfig> WorkflowTypeConfigs { get; set; }
  public DbSet<WorkflowTypeConfigAction> WorkflowTypeConfigActions { get; set; }
  public DbSet<WorkflowTypeConfigActionFileType> WorkflowTypeConfigActionFileTypes { get; set; }
  public DbSet<WorkflowTypeConfigCondition> WorkflowTypeConfigConditions { get; set; }
  public DbSet<WorkflowTypeConfigField> WorkflowTypeConfigFields { get; set; }
  public DbSet<WorkflowTypeConfigValidation> WorkflowTypeConfigValidations { get; set; }
  public DbSet<WorkflowTypeConfigSla> WorkflowTypeConfigSlas { get; set; }
  public DbSet<WorkflowTypeConfigNotification> WorkflowTypeConfigNotifications { get; set; }
  public DbSet<WorkflowPermission> WorkflowPermissions { get; set; }
  public DbSet<Workflow> Workflows { get; set; }
  public DbSet<WorkflowTask> WorkflowTasks { get; set; }
  public DbSet<WorkflowTaskOwner> WorkflowTaskOwners { get; set; }
  public DbSet<WorkflowItem> WorkflowItems { get; set; }
  public DbSet<WorkflowItemMetadata> WorkflowItemMetadatas { get; set; }

  public DbSet<JarbassAgent> JarbassAgents { get; set; }
  public DbSet<JarbassConfig> JarbassConfigs { get; set; }
  public DbSet<JarbassJob> JarbassJobs { get; set; }
  public DbSet<JarbassSyncEvent> JarbassSyncEvents { get; set; }
  public DbSet<JarbassConflictAlert> JarbassConflictAlerts { get; set; }
  public DbSet<JarbassInsight> JarbassInsights { get; set; }
  public DbSet<JarbassSecurityScope> JarbassSecurityScopes { get; set; }
  public DbSet<JarbassSecurityLevel> JarbassSecurityLevels { get; set; }
  public DbSet<JarbassPermissionLevel> JarbassPermissionLevels { get; set; }
  public DbSet<JarbassEncryptionState> JarbassEncryptionStates { get; set; }
  public DbSet<JarbassProtectedFile> JarbassProtectedFiles { get; set; }
  public DbSet<JarbassWorkflowWatcher> JarbassWorkflowWatchers { get; set; }
  public DbSet<Notification> Notifications { get; set; }
  public DbSet<UserNotification> UserNotifications { get; set; }
  public DbSet<MpxRoute> Routes { get; set; }
  public DbSet<MpxErrorSeverity> ErrorSeverities { get; set; }
  public DbSet<MpxErrorState> ErrorStates { get; set; }
  public DbSet<MpxErrorCode> ErrorCodes { get; set; }
  public DbSet<MpxError> Errors { get; set; }
  public DbSet<WkfTriggerType> WorkflowTriggerTypes { get; set; }
  public DbSet<WkfStationType> WorkflowStationTypes { get; set; }
  public DbSet<MpxParameterScope> ParameterScopes { get; set; }
  public DbSet<MpxParameter> Parameters { get; set; }
  public DbSet<MpxComponentType> ComponentTypes { get; set; }
  public DbSet<MpxScreenComponent> ScreenComponents { get; set; }

  public async Task<IMpxTransaction> BeginTransactionAsync()
  {
    var efTransaction = await Database.BeginTransactionAsync();
    return new MpxTransaction(this, efTransaction);
  }

  public async Task<int> SaveChangesAsync()
  {
    return await SaveChangesAsync(CancellationToken.None);
  }
}
