using System.Text;
using System.Text.Json.Serialization;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

using Mpx.Application.Handlers;
using Mpx.Application.Validators;
using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;
using Mpx.Infrastructure.Data.Core;
using Mpx.Infrastructure.Data.Repositories;
using Mpx.Infrastructure.Interfaces;
using Mpx.Infrastructure.MultiTenant;

using Npgsql;

namespace Mpx.CrossCutting;

public static class DependencyInjection
{
  public static WebApplicationBuilder AddMorphusDependencyInjection(this WebApplicationBuilder builder)
  {
    AddCors(builder);
    AddMpxDbContext(builder.Services, builder.Configuration);
    AddDependencyInjection(builder.Services);
    AddJsonSettings(builder);
    AddMpxJwtAuthentication(builder);
    AddMpxAuthorizationPolicies(builder);

    return builder;
  }

  public static IServiceCollection AddMorphusWorkerDependencyInjection(this IServiceCollection services, IConfiguration configuration)
  {
    AddMpxDbContext(services, configuration);
    AddDependencyInjection(services);

    return services;
  }

  public static void SyncMorphusEntityCatalog(this IServiceProvider services)
  {
    using var scope = services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MpxDbContext>();
    SeedSystemEntityCatalog(dbContext);
  }

  public static WebApplication ApplyMorphusMigrations(this WebApplication app)
  {
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MpxDbContext>();

    if (string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB"), "true", StringComparison.OrdinalIgnoreCase))
    {
      dbContext.Database.ExecuteSqlRaw("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
      Console.WriteLine(">>> SCHEMA PUBLIC RECRIADO DO ZERO! <<<");
    }

    dbContext.Database.Migrate();

    dbContext.Database.ExecuteSqlRaw("""
        ALTER TABLE sec_users ADD COLUMN IF NOT EXISTS first_name character varying(20) NULL;
        ALTER TABLE sec_users ADD COLUMN IF NOT EXISTS last_name character varying(20) NULL;
        CREATE TABLE IF NOT EXISTS mpx_corporation_domains (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NOT NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            domain_name character varying(150) NOT NULL UNIQUE,
            origin_type character varying(40) NOT NULL DEFAULT 'CustomerOwned',
            verification_status character varying(40) NOT NULL DEFAULT 'PendingVerification',
            verification_token character varying(120) NULL,
            is_primary boolean NOT NULL DEFAULT false,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            description character varying(120) NULL
        );
        CREATE TABLE IF NOT EXISTS mpx_corporation_domain_records (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NOT NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            corporation_domain_id uuid NOT NULL REFERENCES mpx_corporation_domains(id) ON DELETE CASCADE,
            record_type character varying(20) NOT NULL DEFAULT 'CNAME',
            host_name character varying(150) NOT NULL,
            value character varying(500) NOT NULL,
            ttl integer NOT NULL DEFAULT 3600,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            description character varying(120) NULL
        );
        CREATE TABLE IF NOT EXISTS mpx_application_settings (
            id uuid NOT NULL PRIMARY KEY,
            corporation_id uuid NOT NULL REFERENCES mpx_corporations(id) ON DELETE RESTRICT,
            application_id uuid NOT NULL REFERENCES mpx_applications(id) ON DELETE CASCADE,
            setting_key character varying(80) NOT NULL,
            label character varying(150) NOT NULL,
            value_type character varying(40) NOT NULL DEFAULT 'string',
            value character varying(500) NOT NULL DEFAULT '',
            endpoint_url character varying(300) NULL,
            refresh_policy character varying(40) NOT NULL DEFAULT 'manual',
            is_locked_system boolean NOT NULL DEFAULT false,
            "order" integer NOT NULL DEFAULT 0,
            key character varying(100) NOT NULL UNIQUE,
            system boolean NOT NULL DEFAULT false,
            inactive boolean NOT NULL DEFAULT false,
            description character varying(120) NULL,
            CONSTRAINT uq_mpx_application_settings_app_key UNIQUE (application_id, setting_key)
        );
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_days integer NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS shared_with_workspace_id uuid NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS available_for_trial boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS layout_key character varying(60) NOT NULL DEFAULT 'sidebar-default';
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS custom_layout_html text NULL;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS domain_mode character varying(40) NOT NULL DEFAULT 'MorphusSuggested';
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS subdomain character varying(80) NULL;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS corporation_domain_id uuid NULL REFERENCES mpx_corporation_domains(id) ON DELETE SET NULL;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS full_domain character varying(180) NULL;
        ALTER TABLE mpx_application_users ADD COLUMN IF NOT EXISTS workspace_id uuid NULL;
        ALTER TABLE mpx_application_users ADD COLUMN IF NOT EXISTS color character varying(250) NULL;
        ALTER TABLE mpx_application_users ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_workspace_users ADD COLUMN IF NOT EXISTS color character varying(50) NULL;
        ALTER TABLE mpx_workspace_users ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_corporation_users ADD COLUMN IF NOT EXISTS color character varying(50) NULL;
        ALTER TABLE mpx_corporation_users ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS route_pattern character varying(150) NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS html_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS custom_html_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS css_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS ts_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS js_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS is_custom_html boolean NOT NULL DEFAULT false;
        UPDATE mpx_applications SET description = LEFT(description, 120) WHERE description IS NOT NULL AND LENGTH(description) > 120;
        ALTER TABLE mpx_applications ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_workspaces SET description = LEFT(description, 120) WHERE description IS NOT NULL AND LENGTH(description) > 120;
        ALTER TABLE mpx_workspaces ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_corporations SET description = LEFT(description, 120) WHERE description IS NOT NULL AND LENGTH(description) > 120;
        ALTER TABLE mpx_corporations ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_modules SET description = 'Gestão granular de usuários, perfis e permissões isolados por corporação, filial, workspace e aplicação.' WHERE title = 'Acessos e Permissões';
        UPDATE mpx_modules SET description = 'Estrutura hierárquica entre matriz e múltiplas filiais, permitindo alternar de ambiente com apenas um clique.' WHERE title = 'Corporações e Filiais';
        UPDATE mpx_modules SET description = LEFT(description, 120) WHERE LENGTH(description) > 120;
        ALTER TABLE mpx_modules ALTER COLUMN description TYPE character varying(120);
        UPDATE mpx_application_modules SET name = LEFT(name, 20) WHERE LENGTH(name) > 20;
        UPDATE mpx_application_modules SET label = LEFT(label, 20) WHERE LENGTH(label) > 20;
        ALTER TABLE mpx_application_modules ALTER COLUMN name TYPE character varying(20);
        ALTER TABLE mpx_application_modules ALTER COLUMN label TYPE character varying(20);
        UPDATE mpx_application_sub_modules SET name = LEFT(name, 20) WHERE LENGTH(name) > 20;
        UPDATE mpx_application_sub_modules SET label = LEFT(label, 20) WHERE LENGTH(label) > 20;
        ALTER TABLE mpx_application_sub_modules ALTER COLUMN name TYPE character varying(20);
        ALTER TABLE mpx_application_sub_modules ALTER COLUMN label TYPE character varying(20);
        """);

    if (!dbContext.Features.Any() || !dbContext.ModuleCategories.Any())
    {
      var (features, categories) = MpxAccountSeed.CreateDefaultShowcaseContent();
      if (!dbContext.Features.Any())
      {
        dbContext.Features.AddRange(features);
      }
      if (!dbContext.ModuleCategories.Any())
      {
        dbContext.ModuleCategories.AddRange(categories);
      }
      dbContext.SaveChanges();
      Console.WriteLine(">>> TABELAS SHOWCASE DA HOME (mpx_features / mpx_modules) POPULADAS COM SUCESSO! <<<");
    }

    SeedSystemEntityCatalog(dbContext);

    if (string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB"), "true", StringComparison.OrdinalIgnoreCase) &&
        string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB_EXIT"), "true", StringComparison.OrdinalIgnoreCase))
    {
      Environment.Exit(0);
    }

    return app;
  }

  private static void SeedSystemEntityCatalog(MpxDbContext dbContext)
  {
    var existingEntities = dbContext.EntityDefinitions
        .Include(e => e.Properties)
        .Where(e => e.CorporationId == null && e.System)
        .ToList();

    var entityByName = existingEntities.ToDictionary(e => e.Name, StringComparer.OrdinalIgnoreCase);
    var entityByClrType = new Dictionary<Type, EntityDefinition>();
    var hasChanges = false;

    foreach (var et in dbContext.Model.GetEntityTypes())
    {
      var clrType = et.ClrType;
      if (clrType.IsAbstract)
        continue;

      var tableName = et.GetTableName() ?? clrType.Name;
      var entityName = clrType.Name;
      var moduleName = InferModuleNameFromTable(tableName);

      if (!entityByName.TryGetValue(entityName, out var entityDef))
      {
        entityDef = new EntityDefinition
        {
          Id = Guid.NewGuid(),
          CorporationId = null,
          Name = entityName,
          TableName = tableName,
          Label = FormatFriendlyLabel(entityName),
          PluralLabel = FormatFriendlyLabel(entityName) + "s",
          ModuleName = moduleName,
          Icon = InferEntityIcon(moduleName, entityName),
          System = true,
          Inactive = false,
          Description = $"Entidade nativa do módulo {moduleName} ({tableName})."
        };
        dbContext.EntityDefinitions.Add(entityDef);
        entityByName[entityName] = entityDef;
        hasChanges = true;
      }

      entityByClrType[clrType] = entityDef;
    }

    if (hasChanges)
    {
      dbContext.SaveChanges();
    }

    var propChanges = false;
    foreach (var et in dbContext.Model.GetEntityTypes())
    {
      if (!entityByClrType.TryGetValue(et.ClrType, out var ownerDef))
        continue;

      var existingProps = ownerDef.Properties.ToDictionary(p => p.Name, StringComparer.OrdinalIgnoreCase);
      var order = existingProps.Count;

      foreach (var prop in et.GetProperties())
      {
        if (existingProps.ContainsKey(prop.Name))
          continue;

        var isPk = prop.IsPrimaryKey();
        var isFk = prop.IsForeignKey();
        Guid? targetDefId = null;

        if (isFk)
        {
          var fk = prop.GetContainingForeignKeys().FirstOrDefault();
          if (fk is not null && entityByClrType.TryGetValue(fk.PrincipalEntityType.ClrType, out var principalDef))
          {
            targetDefId = principalDef.Id;
          }
        }

        var (dataType, controlType) = InferScalarDataType(prop.Name, prop.ClrType);
        var maxLen = prop.GetMaxLength();
        var colName = prop.GetColumnName();

        var newProp = new EntityProperty
        {
          Id = Guid.NewGuid(),
          CorporationId = null,
          EntityDefinitionId = ownerDef.Id,
          Name = prop.Name,
          ColumnName = colName,
          Label = FormatFriendlyLabel(prop.Name),
          DataType = dataType,
          DefaultControlType = isFk ? "Select" : controlType,
          TargetEntityDefinitionId = targetDefId,
          ForeignKeyPropertyName = isFk ? prop.Name : null,
          IsPrimaryKey = isPk,
          IsForeignKey = isFk,
          IsRequired = !prop.IsNullable,
          MaxLength = maxLen,
          Order = ++order,
          System = true,
          Inactive = false
        };

        dbContext.EntityProperties.Add(newProp);
        existingProps[prop.Name] = newProp;
        propChanges = true;
      }

      foreach (var nav in et.GetNavigations())
      {
        if (existingProps.ContainsKey(nav.Name))
          continue;

        entityByClrType.TryGetValue(nav.TargetEntityType.ClrType, out var targetDef);
        var fkPropName = nav.ForeignKey.Properties.FirstOrDefault()?.Name;
        var isCollection = nav.IsCollection;

        var navProp = new EntityProperty
        {
          Id = Guid.NewGuid(),
          CorporationId = null,
          EntityDefinitionId = ownerDef.Id,
          Name = nav.Name,
          ColumnName = null,
          Label = FormatFriendlyLabel(nav.Name),
          DataType = isCollection ? "ListOfEntities" : "Entity",
          DefaultControlType = isCollection ? "MultiSelect" : "Select",
          TargetEntityDefinitionId = targetDef?.Id,
          ForeignKeyPropertyName = fkPropName,
          IsPrimaryKey = false,
          IsForeignKey = false,
          IsRequired = !isCollection && nav.ForeignKey.IsRequired,
          Order = ++order,
          System = true,
          Inactive = false
        };

        dbContext.EntityProperties.Add(navProp);
        existingProps[nav.Name] = navProp;
        propChanges = true;
      }
    }

    if (propChanges)
    {
      dbContext.SaveChanges();
      Console.WriteLine(">>> CATÁLOGO DE ENTIDADES E PROPRIEDADES (mpx_entities / mpx_entity_properties) SINCRONIZADO VIA REFLECTION! <<<");
    }
  }

  private static string InferModuleNameFromTable(string tableName)
  {
    if (tableName.StartsWith("sec_", StringComparison.OrdinalIgnoreCase))
      return "Security";
    if (tableName.StartsWith("wkf_", StringComparison.OrdinalIgnoreCase))
      return "Workflow";
    if (tableName.StartsWith("jrb_", StringComparison.OrdinalIgnoreCase))
      return "Jarbass";
    if (tableName.StartsWith("mpx_emails", StringComparison.OrdinalIgnoreCase))
      return "Send";
    if (tableName.StartsWith("mpx_feature", StringComparison.OrdinalIgnoreCase) ||
        tableName.Equals("mpx_module_categories", StringComparison.OrdinalIgnoreCase) ||
        tableName.Equals("mpx_modules", StringComparison.OrdinalIgnoreCase))
      return "Website";
    return "Morphus";
  }

  private static string InferEntityIcon(string moduleName, string entityName)
  {
    return moduleName switch
    {
      "Security" => entityName.Contains("User") ? "users" : "shield-check",
      "Workflow" => "workflow",
      "Jarbass" => "bot",
      "Send" => "send",
      "Website" => "globe",
      _ => entityName.Contains("Corporation") ? "building-2" : "database"
    };
  }

  private static (string DataType, string ControlType) InferScalarDataType(string propName, Type clrType)
  {
    var underlying = Nullable.GetUnderlyingType(clrType) ?? clrType;
    if (underlying == typeof(Guid))
      return ("Guid", "Input");
    if (underlying == typeof(bool))
      return ("Boolean", "Switch");
    if (underlying == typeof(int) || underlying == typeof(long) || underlying == typeof(short))
      return ("Number", "NumberInput");
    if (underlying == typeof(decimal) || underlying == typeof(double) || underlying == typeof(float))
      return ("Decimal", "CurrencyInput");
    if (underlying == typeof(DateTime) || underlying == typeof(DateTimeOffset))
      return ("DateTime", "DatePicker");
    if (propName.Contains("Email", StringComparison.OrdinalIgnoreCase))
      return ("Email", "Input");
    return ("Text", "Input");
  }

  private static string FormatFriendlyLabel(string pascalName)
  {
    if (string.IsNullOrWhiteSpace(pascalName))
      return pascalName;
    var sb = new System.Text.StringBuilder();
    for (var i = 0; i < pascalName.Length; i++)
    {
      var c = pascalName[i];
      if (i > 0 && char.IsUpper(c) && !char.IsUpper(pascalName[i - 1]))
      {
        sb.Append(' ');
      }
      sb.Append(c);
    }
    return sb.ToString();
  }

  private static WebApplicationBuilder AddCors(this WebApplicationBuilder builder)
  {
    builder.Services.AddCors(options =>
    {
      options.AddPolicy("MorphusCorsPolicy", policy =>
      {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "https://morphus.one",
                "https://www.morphus.one",
                "https://morphus.site",
                "https://homolog.morphus.one",
                "http://179.197.232.25",
                "http://192.168.0.100"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
      });
    });

    return builder;
  }

  private static IServiceCollection AddDependencyInjection(IServiceCollection services)
  {
    services.AddHttpContextAccessor();
    services.AddScoped<ITenantProvider, TenantProvider>();

    services.AddScoped<MpxDbContext>();
    services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<MpxDbContext>());

    // Repositórios
    services.AddScoped(typeof(IMpxRepository<>), typeof(MpxRepository<>));
    services.AddScoped<ICorporationRepository, CorporationRepository>();
    services.AddScoped<ICorporationUserRepository, CorporationUserRepository>();
    services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();
    services.AddScoped<IWorkspaceUserRepository, WorkspaceUserRepository>();
    services.AddScoped<IWorkspaceApplicationRepository, WorkspaceApplicationRepository>();
    services.AddScoped<IApplicationRepository, ApplicationRepository>();
    services.AddScoped<IApplicationUserRepository, ApplicationUserRepository>();
    services.AddScoped<IMenuRepository, MenuRepository>();
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IUserStatusRepository, UserStatusRepository>();
    services.AddScoped<IModuleRepository, ModuleRepository>();
    services.AddScoped<ISubModuleRepository, SubModuleRepository>();
    services.AddScoped<IRoleRepository, RoleRepository>();
    services.AddScoped<IClaimRepository, ClaimRepository>();
    services.AddScoped<IRoleClaimRepository, RoleClaimRepository>();
    services.AddScoped<IUserRoleRepository, UserRoleRepository>();
    services.AddScoped<IUserClaimRepository, UserClaimRepository>();
    services.AddScoped<IEmailRepository, EmailRepository>();

    // Validators da Camada Application
    services.AddScoped<ICorporationValidator, CorporationValidator>();
    services.AddScoped<IWorkspaceValidator, WorkspaceValidator>();

    // Handlers da Camada Application
    services.AddScoped<SecurityHandler>();
    services.AddScoped<EmailHandler>();
    services.AddScoped<CorporationHandler>();
    services.AddScoped<CorporationUserHandler>();
    services.AddScoped<WorkspaceHandler>();
    services.AddScoped<WorkspaceUserHandler>();
    services.AddScoped<WorkspaceApplicationHandler>();
    services.AddScoped<ApplicationHandler>();
    services.AddScoped<ApplicationUserHandler>();
    services.AddScoped<MenuHandler>();
    services.AddScoped<UserHandler>();
    services.AddScoped<UserStatusHandler>();
    services.AddScoped<ModuleHandler>();
    services.AddScoped<SubModuleHandler>();
    services.AddScoped<RoleHandler>();
    services.AddScoped<ClaimHandler>();
    services.AddScoped<RoleClaimHandler>();
    services.AddScoped<UserRoleHandler>();
    services.AddScoped<UserClaimHandler>();

    return services;
  }

  private static IServiceCollection AddMpxDbContext(IServiceCollection services, IConfiguration configuration)
  {
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    var connectionBuilder = new NpgsqlConnectionStringBuilder(connectionString)
    {
      Password = Environment.GetEnvironmentVariable("POSTGRES_DB_PASSWORD")
               ?? throw new InvalidOperationException("Nenhuma senha de banco de dados configurada")
    };

    services.AddDbContext<MpxDbContext>(options =>
             options.UseSnakeCaseNamingConvention()
                    .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning))
                    .UseNpgsql(connectionBuilder.ConnectionString, b => b
                    .MigrationsAssembly(typeof(MpxDbContext)
                    .Assembly.FullName)));

    return services;
  }

  private static WebApplicationBuilder AddJsonSettings(this WebApplicationBuilder builder)
  {
    builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
              options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
              options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
              options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
              options.JsonSerializerOptions.MaxDepth = 128;
            });

    return builder;
  }

  private static WebApplicationBuilder AddMpxJwtAuthentication(this WebApplicationBuilder builder)
  {
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? builder.Configuration["JWT:SecretKey"]
        ?? throw new InvalidOperationException("Chave secreta JWT não configurada.");

    var validIssuer = builder.Configuration["JWT:ValidIssuer"] ?? "https://morphus.one";
    var validAudience = builder.Configuration["JWT:ValidAudience"] ?? "https://morphus.one";

    builder.Services.AddAuthentication(options =>
    {
      options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
    {
      options.SaveToken = true;
      options.RequireHttpsMetadata = false;
      options.TokenValidationParameters = new TokenValidationParameters
      {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,
        ValidIssuer = validIssuer,
        ValidAudience = validAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
      };
    });

    return builder;
  }

  private static WebApplicationBuilder AddMpxAuthorizationPolicies(this WebApplicationBuilder builder)
  {
    var auth = builder.Services.AddAuthorizationBuilder();

    auth.AddPolicy("ADMINISTRATOR", p => p.RequireRole("ADMINISTRATOR"));

    // User
    auth.AddPolicy("USER_GET_BY_ID", p => p.RequireClaim("USER", "GET_BY_ID"));
    auth.AddPolicy("USER_LIST", p => p.RequireClaim("USER", "LIST"));
    auth.AddPolicy("USER_CREATE", p => p.RequireClaim("USER", "CREATE"));
    auth.AddPolicy("USER_UPDATE", p => p.RequireClaim("USER", "UPDATE"));
    auth.AddPolicy("USER_DELETE", p => p.RequireClaim("USER", "DELETE"));

    // UserRole
    auth.AddPolicy("USER_ROLE_LIST", p => p.RequireClaim("USER_ROLE", "LIST"));
    auth.AddPolicy("USER_ROLE_ADD", p => p.RequireClaim("USER_ROLE", "ADD"));
    auth.AddPolicy("USER_ROLE_REMOVE", p => p.RequireClaim("USER_ROLE", "REMOVE"));
    auth.AddPolicy("USER_ROLE_ACTIVATE", p => p.RequireClaim("USER_ROLE", "ACTIVATE"));
    auth.AddPolicy("USER_ROLE_INACTIVATE", p => p.RequireClaim("USER_ROLE", "INACTIVATE"));

    // UserClaim
    auth.AddPolicy("USER_CLAIM_LIST", p => p.RequireClaim("USER_CLAIM", "LIST"));
    auth.AddPolicy("USER_CLAIM_ADD", p => p.RequireClaim("USER_CLAIM", "ADD"));
    auth.AddPolicy("USER_CLAIM_REMOVE", p => p.RequireClaim("USER_CLAIM", "REMOVE"));
    auth.AddPolicy("USER_CLAIM_ACTIVATE", p => p.RequireClaim("USER_CLAIM", "ACTIVATE"));
    auth.AddPolicy("USER_CLAIM_INACTIVATE", p => p.RequireClaim("USER_CLAIM", "INACTIVATE"));

    // UserStatus
    auth.AddPolicy("USER_STATUS_GET_BY_ID", p => p.RequireClaim("USER_STATUS", "GET_BY_ID"));
    auth.AddPolicy("USER_STATUS_LIST", p => p.RequireClaim("USER_STATUS", "LIST"));
    auth.AddPolicy("USER_STATUS_CREATE", p => p.RequireClaim("USER_STATUS", "CREATE"));
    auth.AddPolicy("USER_STATUS_UPDATE", p => p.RequireClaim("USER_STATUS", "UPDATE"));
    auth.AddPolicy("USER_STATUS_DELETE", p => p.RequireClaim("USER_STATUS", "DELETE"));

    // Role
    auth.AddPolicy("ROLE_GET_BY_ID", p => p.RequireClaim("ROLE", "GET_BY_ID"));
    auth.AddPolicy("ROLE_LIST", p => p.RequireClaim("ROLE", "LIST"));
    auth.AddPolicy("ROLE_CREATE", p => p.RequireClaim("ROLE", "CREATE"));
    auth.AddPolicy("ROLE_UPDATE", p => p.RequireClaim("ROLE", "UPDATE"));
    auth.AddPolicy("ROLE_DELETE", p => p.RequireClaim("ROLE", "DELETE"));

    // RoleClaim
    auth.AddPolicy("ROLE_CLAIM_LIST", p => p.RequireClaim("ROLE_CLAIM", "LIST"));
    auth.AddPolicy("ROLE_CLAIM_ADD", p => p.RequireClaim("ROLE_CLAIM", "ADD"));
    auth.AddPolicy("ROLE_CLAIM_REMOVE", p => p.RequireClaim("ROLE_CLAIM", "REMOVE"));
    auth.AddPolicy("ROLE_CLAIM_ACTIVATE", p => p.RequireClaim("ROLE_CLAIM", "ACTIVATE"));
    auth.AddPolicy("ROLE_CLAIM_INACTIVATE", p => p.RequireClaim("ROLE_CLAIM", "INACTIVATE"));

    // Claim
    auth.AddPolicy("CLAIM_GET_BY_ID", p => p.RequireClaim("CLAIM", "GET_BY_ID"));
    auth.AddPolicy("CLAIM_LIST", p => p.RequireClaim("CLAIM", "LIST"));
    auth.AddPolicy("CLAIM_CREATE", p => p.RequireClaim("CLAIM", "CREATE"));
    auth.AddPolicy("CLAIM_UPDATE", p => p.RequireClaim("CLAIM", "UPDATE"));
    auth.AddPolicy("CLAIM_DELETE", p => p.RequireClaim("CLAIM", "DELETE"));

    // Corporation
    auth.AddPolicy("CORPORATION_GET_BY_ID", p => p.RequireClaim("CORPORATION", "GET_BY_ID"));
    auth.AddPolicy("CORPORATION_LIST", p => p.RequireClaim("CORPORATION", "LIST"));
    auth.AddPolicy("CORPORATION_CREATE", p => p.RequireClaim("CORPORATION", "CREATE"));
    auth.AddPolicy("CORPORATION_UPDATE", p => p.RequireClaim("CORPORATION", "UPDATE"));
    auth.AddPolicy("CORPORATION_DELETE", p => p.RequireClaim("CORPORATION", "DELETE"));

    // CorporationUser
    auth.AddPolicy("CORPORATION_USER_LIST", p => p.RequireClaim("CORPORATION_USER", "LIST"));
    auth.AddPolicy("CORPORATION_USER_ADD", p => p.RequireClaim("CORPORATION_USER", "ADD"));
    auth.AddPolicy("CORPORATION_USER_REMOVE", p => p.RequireClaim("CORPORATION_USER", "REMOVE"));
    auth.AddPolicy("CORPORATION_USER_ACTIVATE", p => p.RequireClaim("CORPORATION_USER", "ACTIVATE"));
    auth.AddPolicy("CORPORATION_USER_INACTIVATE", p => p.RequireClaim("CORPORATION_USER", "INACTIVATE"));
    auth.AddPolicy("CORPORATION_USER_SET_OWNER", p => p.RequireClaim("CORPORATION_USER", "SET_OWNER"));
    auth.AddPolicy("CORPORATION_USER_REMOVE_OWNER", p => p.RequireClaim("CORPORATION_USER", "REMOVE_OWNER"));

    // Module & SubModule
    auth.AddPolicy("MODULE_GET_BY_ID", p => p.RequireClaim("MODULE", "GET_BY_ID"));
    auth.AddPolicy("MODULE_LIST", p => p.RequireClaim("MODULE", "LIST"));
    auth.AddPolicy("MODULE_GET_BY_KEY", p => p.RequireClaim("MODULE", "GET_BY_KEY"));
    auth.AddPolicy("MODULE_CREATE", p => p.RequireClaim("MODULE", "CREATE"));
    auth.AddPolicy("MODULE_UPDATE", p => p.RequireClaim("MODULE", "UPDATE"));
    auth.AddPolicy("MODULE_DELETE", p => p.RequireClaim("MODULE", "DELETE"));
    auth.AddPolicy("MODULE_SUB_MODULES", p => p.RequireClaim("MODULE", "SUB_MODULES"));

    auth.AddPolicy("SUB_MODULE_GET_BY_ID", p => p.RequireClaim("SUB_MODULE", "GET_BY_ID"));
    auth.AddPolicy("SUB_MODULE_LIST", p => p.RequireClaim("SUB_MODULE", "LIST"));
    auth.AddPolicy("SUB_MODULE_CREATE", p => p.RequireClaim("SUB_MODULE", "CREATE"));
    auth.AddPolicy("SUB_MODULE_UPDATE", p => p.RequireClaim("SUB_MODULE", "UPDATE"));
    auth.AddPolicy("SUB_MODULE_DELETE", p => p.RequireClaim("SUB_MODULE", "DELETE"));

    // Workspace & WorkspaceUser
    auth.AddPolicy("WORKSPACE_GET_BY_ID", p => p.RequireClaim("WORKSPACE", "GET_BY_ID"));
    auth.AddPolicy("WORKSPACE_GET_BY_KEY", p => p.RequireClaim("WORKSPACE", "GET_BY_KEY"));
    auth.AddPolicy("WORKSPACE_LIST", p => p.RequireClaim("WORKSPACE", "LIST"));
    auth.AddPolicy("WORKSPACE_CREATE", p => p.RequireClaim("WORKSPACE", "CREATE"));
    auth.AddPolicy("WORKSPACE_UPDATE", p => p.RequireClaim("WORKSPACE", "UPDATE"));
    auth.AddPolicy("WORKSPACE_DELETE", p => p.RequireClaim("WORKSPACE", "DELETE"));

    auth.AddPolicy("WORKSPACE_USER_LIST", p => p.RequireClaim("WORKSPACE_USER", "LIST"));
    auth.AddPolicy("WORKSPACE_USER_ADD", p => p.RequireClaim("WORKSPACE_USER", "ADD"));
    auth.AddPolicy("WORKSPACE_USER_REMOVE", p => p.RequireClaim("WORKSPACE_USER", "REMOVE"));
    auth.AddPolicy("WORKSPACE_USER_ACTIVATE", p => p.RequireClaim("WORKSPACE_USER", "ACTIVATE"));
    auth.AddPolicy("WORKSPACE_USER_INACTIVATE", p => p.RequireClaim("WORKSPACE_USER", "INACTIVATE"));
    auth.AddPolicy("WORKSPACE_USER_SET_OWNER", p => p.RequireClaim("WORKSPACE_USER", "SET_OWNER"));
    auth.AddPolicy("WORKSPACE_USER_REMOVE_OWNER", p => p.RequireClaim("WORKSPACE_USER", "REMOVE_OWNER"));

    auth.AddPolicy("WORKSPACE_APPLICATION_LIST", p => p.RequireClaim("WORKSPACE_APPLICATION", "LIST"));
    auth.AddPolicy("WORKSPACE_APPLICATION_ADD", p => p.RequireClaim("WORKSPACE_APPLICATION", "ADD"));
    auth.AddPolicy("WORKSPACE_APPLICATION_REMOVE", p => p.RequireClaim("WORKSPACE_APPLICATION", "REMOVE"));
    auth.AddPolicy("WORKSPACE_APPLICATION_ACTIVATE", p => p.RequireClaim("WORKSPACE_APPLICATION", "ACTIVATE"));
    auth.AddPolicy("WORKSPACE_APPLICATION_INACTIVATE", p => p.RequireClaim("WORKSPACE_APPLICATION", "INACTIVATE"));

    // Application & ApplicationUser
    auth.AddPolicy("APPLICATION_GET_BY_ID", p => p.RequireClaim("APPLICATION", "GET_BY_ID"));
    auth.AddPolicy("APPLICATION_GET_BY_KEY", p => p.RequireClaim("APPLICATION", "GET_BY_KEY"));
    auth.AddPolicy("APPLICATION_LIST", p => p.RequireClaim("APPLICATION", "LIST"));
    auth.AddPolicy("APPLICATION_CREATE", p => p.RequireClaim("APPLICATION", "CREATE"));
    auth.AddPolicy("APPLICATION_UPDATE", p => p.RequireClaim("APPLICATION", "UPDATE"));
    auth.AddPolicy("APPLICATION_DELETE", p => p.RequireClaim("APPLICATION", "DELETE"));

    auth.AddPolicy("APPLICATION_USER_LIST", p => p.RequireClaim("APPLICATION_USER", "LIST"));
    auth.AddPolicy("APPLICATION_USER_ADD", p => p.RequireClaim("APPLICATION_USER", "ADD"));
    auth.AddPolicy("APPLICATION_USER_REMOVE", p => p.RequireClaim("APPLICATION_USER", "REMOVE"));
    auth.AddPolicy("APPLICATION_USER_ACTIVATE", p => p.RequireClaim("APPLICATION_USER", "ACTIVATE"));
    auth.AddPolicy("APPLICATION_USER_INACTIVATE", p => p.RequireClaim("APPLICATION_USER", "INACTIVATE"));
    auth.AddPolicy("APPLICATION_USER_SET_OWNER", p => p.RequireClaim("APPLICATION_USER", "SET_OWNER"));
    auth.AddPolicy("APPLICATION_USER_REMOVE_OWNER", p => p.RequireClaim("APPLICATION_USER", "REMOVE_OWNER"));

    // Menu
    auth.AddPolicy("MENU_GET_BY_ID", p => p.RequireClaim("MENU", "GET_BY_ID"));
    auth.AddPolicy("MENU_LIST", p => p.RequireClaim("MENU", "LIST"));
    auth.AddPolicy("MENU_CREATE", p => p.RequireClaim("MENU", "CREATE"));
    auth.AddPolicy("MENU_UPDATE", p => p.RequireClaim("MENU", "UPDATE"));
    auth.AddPolicy("MENU_DELETE", p => p.RequireClaim("MENU", "DELETE"));

    return builder;
  }
}
