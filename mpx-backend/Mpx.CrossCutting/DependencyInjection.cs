using System.Text;
using System.Text.Json.Serialization;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

using mpx.Domain.Interfaces;
using Mpx.Domain.Interfaces;
using Mpx.Domain.Security;
using Mpx.Application.Handlers;
using Mpx.Application.Validators;
using Mpx.Infrastructure.Data;
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
    AddMorphusDbContext(builder);
    AddDependencyInjection(builder);
    AddJsonSettings(builder);
    AddMorphusJwtAuthentication(builder);
    AddMorphusAuthorizationPolicies(builder);

    return builder;
  }

  public static WebApplication ApplyMorphusMigrations(this WebApplication app)
  {
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MorphusDbContext>();

    if (string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB"), "true", StringComparison.OrdinalIgnoreCase))
    {
      dbContext.Database.ExecuteSqlRaw("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
      Console.WriteLine(">>> SCHEMA PUBLIC RECRIADO DO ZERO! <<<");
    }

    dbContext.Database.Migrate();

    dbContext.Database.ExecuteSqlRaw("""
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_days integer NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS shared_with_workspace_id uuid NULL;
        ALTER TABLE mpx_workspace_applications ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS available_for_trial boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS "default" boolean NOT NULL DEFAULT false;
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS layout_key character varying(60) NOT NULL DEFAULT 'sidebar-default';
        ALTER TABLE mpx_applications ADD COLUMN IF NOT EXISTS custom_layout_html text NULL;
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
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS css_content text NULL;
        ALTER TABLE mpx_application_sub_modules ADD COLUMN IF NOT EXISTS js_content text NULL;
        UPDATE mpx_applications SET available_for_trial = true WHERE prefix IN ('FIN', 'FLW', 'MAL') OR name IN ('Morphus Financeiro', 'Morphus Flow', 'Morphus Mail');
        UPDATE mpx_applications SET "default" = true WHERE prefix = 'FIN' OR name = 'Morphus Financeiro';
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
      var (features, categories) = MorphusAccountSeed.CreateDefaultShowcaseContent();
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

    if (string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB"), "true", StringComparison.OrdinalIgnoreCase) &&
        string.Equals(Environment.GetEnvironmentVariable("RESET_MORPHUS_DB_EXIT"), "true", StringComparison.OrdinalIgnoreCase))
    {
      Environment.Exit(0);
    }

    return app;
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
                "https://morphus.me",
                "https://www.morphus.me",
                "https://morphus.site",
                "http://179.197.232.25",
                "http://192.168.68.106"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
      });
    });

    return builder;
  }

  private static WebApplicationBuilder AddDependencyInjection(this WebApplicationBuilder builder)
  {
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<ITenantProvider, TenantProvider>();

    builder.Services.AddScoped<MorphusDbContext>();
    builder.Services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<MorphusDbContext>());

    // Repositórios
    builder.Services.AddScoped(typeof(IMorphusRepository<>), typeof(MorphusRepository<>));
    builder.Services.AddScoped<ICorporationRepository, CorporationRepository>();
    builder.Services.AddScoped<ICorporationUserRepository, CorporationUserRepository>();
    builder.Services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();
    builder.Services.AddScoped<IWorkspaceUserRepository, WorkspaceUserRepository>();
    builder.Services.AddScoped<IWorkspaceApplicationRepository, WorkspaceApplicationRepository>();
    builder.Services.AddScoped<IApplicationRepository, ApplicationRepository>();
    builder.Services.AddScoped<IApplicationUserRepository, ApplicationUserRepository>();
    builder.Services.AddScoped<IMenuRepository, MenuRepository>();
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IUserStatusRepository, UserStatusRepository>();
    builder.Services.AddScoped<IModuleRepository, ModuleRepository>();
    builder.Services.AddScoped<ISubModuleRepository, SubModuleRepository>();
    builder.Services.AddScoped<IRoleRepository, RoleRepository>();
    builder.Services.AddScoped<IClaimRepository, ClaimRepository>();
    builder.Services.AddScoped<IRoleClaimRepository, RoleClaimRepository>();
    builder.Services.AddScoped<IUserRoleRepository, UserRoleRepository>();
    builder.Services.AddScoped<IUserClaimRepository, UserClaimRepository>();
    builder.Services.AddScoped<IEmailRepository, EmailRepository>();

    // Validators da Camada Application
    builder.Services.AddScoped<ICorporationValidator, CorporationValidator>();
    builder.Services.AddScoped<IWorkspaceValidator, WorkspaceValidator>();

    // Handlers da Camada Application
    builder.Services.AddScoped<SecurityHandler>();
    builder.Services.AddScoped<EmailHandler>();
    builder.Services.AddScoped<CorporationHandler>();
    builder.Services.AddScoped<CorporationUserHandler>();
    builder.Services.AddScoped<WorkspaceHandler>();
    builder.Services.AddScoped<WorkspaceUserHandler>();
    builder.Services.AddScoped<WorkspaceApplicationHandler>();
    builder.Services.AddScoped<ApplicationHandler>();
    builder.Services.AddScoped<ApplicationUserHandler>();
    builder.Services.AddScoped<MenuHandler>();
    builder.Services.AddScoped<UserHandler>();
    builder.Services.AddScoped<UserStatusHandler>();
    builder.Services.AddScoped<ModuleHandler>();
    builder.Services.AddScoped<SubModuleHandler>();
    builder.Services.AddScoped<RoleHandler>();
    builder.Services.AddScoped<ClaimHandler>();
    builder.Services.AddScoped<RoleClaimHandler>();
    builder.Services.AddScoped<UserRoleHandler>();
    builder.Services.AddScoped<UserClaimHandler>();

    return builder;
  }

  private static WebApplicationBuilder AddMorphusDbContext(this WebApplicationBuilder builder)
  {
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    var connectionBuilder = new NpgsqlConnectionStringBuilder(connectionString)
    {
      Password = Environment.GetEnvironmentVariable("POSTGRES_DB_PASSWORD")
               ?? throw new InvalidOperationException("Nenhuma senha de banco de dados configurada")
    };

    builder.Services.AddDbContext<MorphusDbContext>(options =>
             options.UseSnakeCaseNamingConvention()
                    .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning))
                    .UseNpgsql(connectionBuilder.ConnectionString, b => b
                    .MigrationsAssembly(typeof(MorphusDbContext)
                    .Assembly.FullName)));

    return builder;
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

  private static WebApplicationBuilder AddMorphusJwtAuthentication(this WebApplicationBuilder builder)
  {
    var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
        ?? builder.Configuration["JWT:SecretKey"]
        ?? throw new InvalidOperationException("Chave secreta JWT não configurada.");

    var validIssuer = builder.Configuration["JWT:ValidIssuer"] ?? "https://morphus.me";
    var validAudience = builder.Configuration["JWT:ValidAudience"] ?? "https://morphus.me";

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

  private static WebApplicationBuilder AddMorphusAuthorizationPolicies(this WebApplicationBuilder builder)
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

    //UserStatus
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
