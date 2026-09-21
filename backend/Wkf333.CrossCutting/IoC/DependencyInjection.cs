using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Morphus.Context;
using Morphus.Repository;
using Morphus.Application.MorphusController;
using Morphus.Application.Services.BusinessService;
using Morphus.Application.Services.BusinessUserService;
using Morphus.Application.Services.ClaimService;
using Morphus.Application.Services.MailSerrvice;
using Morphus.Application.Services.ModuleSerrvice;
using Morphus.Application.Services.RoleClaimService;
using Morphus.Application.Services.RoleService;
using Morphus.Application.Services.security;
using Morphus.Application.Services.SubModuleSerrvice;
using Morphus.Application.Services.UserClaimService;
using Morphus.Application.Services.UserRoleService;
using Morphus.Application.Services.UserService;
using Morphus.Application.Services.UserStatusSerrvice;
using Morphus.Domain.IRepositories;
using Morphus.Domain.IMorphusRepository;
using Morphus.Application.Validators;
using Npgsql;
using Morphus.Domain.ITransaction;
using Morphus.Data.Transaction;

namespace Morphus.CrossCutting.IoC;

public static class DependencyInjection
{
    public static IServiceCollection AddW3DbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ConnectionString");

        var connectionBuilder = new NpgsqlConnectionStringBuilder(connectionString)
        {
            Password = configuration["POSTGRES_DB_PASSWORD"] ?? throw new InvalidOperationException("Nenhuma senha de banco de dados configurada"),
        };

        var withPassword = connectionBuilder.ConnectionString;

        services.AddDbContext<W3DbContext>(options => options.UseNpgsql(withPassword).EnableSensitiveDataLogging());

        return services;
    }

    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<DbContext>(sp => sp.GetService<W3DbContext>()!);
        services.AddHttpContextAccessor();

        services.AddScoped(typeof(IMorphusRepository<>), typeof(MorphusRepository<>)); // Registra o repositorio genérico
        services.AddScoped(typeof(MorphusController<>));

        services.AddScoped<IMorphusTransaction, MorphusTransaction>();

        services.AddTransient<IEmailService, EmailService>();
        services.AddScoped<IEmailRepository, EmailRepository>();
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<ISecurityValidator, SecurityValidator>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<IModuleService, ModuleService>();
        services.AddScoped<ISubModuleRepository, SubModuleRepository>();
        services.AddScoped<ISubModuleService, SubModuleService>();
        services.AddScoped<IClaimRepository, ClaimRepository>();
        services.AddScoped<IClaimService, ClaimService>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IRoleClaimRepository, RoleClaimRepository>();
        services.AddScoped<IRoleClaimService, RoleClaimService>();
        services.AddScoped<IUserClaimRepository, UserClaimRepository>();
        services.AddScoped<IUserClaimService, UserClaimService>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();
        services.AddScoped<IUserRoleService, UserRoleService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUserValidator, UserValidator>();
        services.AddScoped<IUserStatusRepository, UserStatusRepository>();
        services.AddScoped<IUserStatusService, UserStatusService>();
        services.AddScoped<IBusinessRepository, BusinessRepository>();
        services.AddScoped<IBusinessService, BusinessService>();
        services.AddScoped<IBusinessUserRepository, BusinessUserRepository>();
        services.AddScoped<IBusinessUserService, BusinessUserService>();

        return services;
    }

    public static IServiceCollection AddW3AddAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var secretKey = configuration["JWT:SecretKey"] ?? throw new ArgumentException("Invalid secret key!!");

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false; // True em produção
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidAudience = configuration["JWT:ValidAudience"],
                    ValidIssuer = configuration["JWT:ValidIssuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                };
            });

        return services;
    }

    public static IServiceCollection AddJsonConfigurations(this IServiceCollection services)
    {
        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            });

        return services;
    }

    public static IServiceCollection AddCors(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(
                "AllowCredentials",
                builder =>
                    builder
                        .WithOrigins(configuration.GetSection("AllowedHosts").Value!)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .SetIsOriginAllowedToAllowWildcardSubdomains()
            );
        });

        return services;
    }

    public static IServiceCollection CreateUsersAuthorizations(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("USER_GET_BY_ID", policy => policy.RequireClaim("USER", "GET_BY_ID"))
            .AddPolicy("USER_LIST", policy => policy.RequireClaim("USER", "LIST"))
            .AddPolicy("USER_CREATE", policy => policy.RequireClaim("USER", "CREATE"))
            .AddPolicy("USER_UPDATE", policy => policy.RequireClaim("USER", "UPDATE"))
            .AddPolicy("USER_DELETE", policy => policy.RequireClaim("USER", "DELETE"));
        return services;
    }

    public static IServiceCollection CreateUserRolesAuthorizations(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("USER_ROLE_LIST", policy => policy.RequireClaim("USER_ROLE", "LIST"))
            .AddPolicy("USER_ROLE_ADD", policy => policy.RequireClaim("USER_ROLE", "ADD"))
            .AddPolicy("USER_ROLE_REMOVE", policy => policy.RequireClaim("USER_ROLE", "REMOVE"))
            .AddPolicy("USER_ROLE_ACTIVATE", policy => policy.RequireClaim("USER_ROLE", "ACTIVATE"))
            .AddPolicy("USER_ROLE_INACTIVATE", policy => policy.RequireClaim("USER_ROLE", "INACTIVATE"));
        return services;
    }

    public static IServiceCollection CreateUserClaimsAuthorizations(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("USER_CLAIM_LIST", policy => policy.RequireClaim("USER_CLAIM", "LIST"))
            .AddPolicy("USER_CLAIM_ADD", policy => policy.RequireClaim("USER_CLAIM", "ADD"))
            .AddPolicy("USER_CLAIM_REMOVE", policy => policy.RequireClaim("USER_CLAIM", "REMOVE"))
            .AddPolicy("USER_CLAIM_ACTIVATE", policy => policy.RequireClaim("USER_CLAIM", "ACTIVATE"))
            .AddPolicy("USER_CLAIM_INACTIVATE", policy => policy.RequireClaim("USER_CLAIM", "INACTIVATE"));
        return services;
    }

    public static IServiceCollection CreateRoleAuthorization(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("ADMINISTRATOR", policy => policy.RequireRole("ADMINISTRATOR"))
            .AddPolicy("ROLE_GET_BY_ID", policy => policy.RequireClaim("ROLE", "GET_BY_ID"))
            .AddPolicy("ROLE_LIST", policy => policy.RequireClaim("ROLE", "LIST"))
            .AddPolicy("ROLE_CREATE", policy => policy.RequireClaim("ROLE", "CREATE"))
            .AddPolicy("ROLE_UPDATE", policy => policy.RequireClaim("ROLE", "UPDATE"))
            .AddPolicy("ROLE_DELETE", policy => policy.RequireClaim("ROLE", "DELETE"));
        return services;
    }

    public static IServiceCollection CreateRoleClaimsAuthorization(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("ROLE_CLAIM_LIST", policy => policy.RequireClaim("ROLE_CLAIM", "LIST"))
            .AddPolicy("ROLE_CLAIM_ADD", policy => policy.RequireClaim("ROLE_CLAIM", "ADD"))
            .AddPolicy("ROLE_CLAIM_REMOVE", policy => policy.RequireClaim("ROLE_CLAIM", "REMOVE"))
            .AddPolicy("ROLE_CLAIM_ACTIVATE", policy => policy.RequireClaim("ROLE_CLAIM", "ACTIVATE"))
            .AddPolicy("ROLE_CLAIM_INACTIVATE", policy => policy.RequireClaim("ROLE_CLAIM", "INACTIVATE"));
        return services;
    }

    public static IServiceCollection CreateBusinessAuthorizations(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("BUSINESS_GET_BY_ID", policy => policy.RequireClaim("BUSINESS", "GET_BY_ID"))
            .AddPolicy("BUSINESS_LIST", policy => policy.RequireClaim("BUSINESS", "LIST"))
            .AddPolicy("BUSINESS_CREATE", policy => policy.RequireClaim("BUSINESS", "CREATE"))
            .AddPolicy("BUSINESS_UPDATE", policy => policy.RequireClaim("BUSINESS", "UPDATE"))
            .AddPolicy("BUSINESS_DELETE", policy => policy.RequireClaim("BUSINESS", "DELETE"));
        return services;
    }

    public static IServiceCollection CreateBusinessUsersAuthorizations(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("BUSINESS_USERS_LIST", policy => policy.RequireClaim("BUSINESS_USER", "LIST"))
            .AddPolicy("BUSINESS_USER_ADD", policy => policy.RequireClaim("BUSINESS_USER", "ADD"))
            .AddPolicy("BUSINESS_USER_REMOVE", policy => policy.RequireClaim("BUSINESS_USER", "REMOVE"))
            .AddPolicy("BUSINESS_USER_ACTIVATE", policy => policy.RequireClaim("BUSINESS_USER", "ACTIVATE"))
            .AddPolicy("BUSINESS_USER_INACTIVATE", policy => policy.RequireClaim("BUSINESS_USER", "INACTIVATE"))
            .AddPolicy("BUSINESS_USER_SET_OWNER", policy => policy.RequireClaim("BUSINESS_USER", "SET_OWNER"))
            .AddPolicy("BUSINESS_USER_REMOVE_OWNER", policy => policy.RequireClaim("BUSINESS_USER", "REMOVE_OWNER"));
        return services;
    }

    public static IServiceCollection CreateClaimAuthorization(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("CLAIM_GET_BY_ID", policy => policy.RequireClaim("CLAIM", "GET_BY_ID"))
            .AddPolicy("CLAIM_LIST", policy => policy.RequireClaim("CLAIM", "LIST"))
            .AddPolicy("CLAIM_CREATE", policy => policy.RequireClaim("CLAIM", "CREATE"))
            .AddPolicy("CLAIM_UPDATE", policy => policy.RequireClaim("CLAIM", "UPDATE"))
            .AddPolicy("CLAIM_DELETE", policy => policy.RequireClaim("CLAIM", "DELETE"));

        return services;
    }

    public static IServiceCollection CreateModuleAuthorization(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("MODULE_GET_BY_ID", policy => policy.RequireClaim("MODULE", "GET_BY_ID"))
            .AddPolicy("MODULE_LIST", policy => policy.RequireClaim("MODULE", "LIST"))
            .AddPolicy("MODULE_GET_BY_KEY", policy => policy.RequireClaim("MODULE", "GET_BY_KEY"))
            .AddPolicy("MODULE_CREATE", policy => policy.RequireClaim("MODULE", "CREATE"))
            .AddPolicy("MODULE_UPDATE", policy => policy.RequireClaim("MODULE", "UPDATE"))
            .AddPolicy("MODULE_DELETE", policy => policy.RequireClaim("MODULE", "DELETE"))
            .AddPolicy("MODULE_SUB_MODULES", policy => policy.RequireClaim("MODULE", "SUB_MODULES"));

        return services;
    }

    public static IServiceCollection CreateSubModuleAuthorization(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("SUB_MODULE_GET_BY_ID", policy => policy.RequireClaim("SUB_MODULE", "GET_BY_ID"))
            .AddPolicy("SUB_MODULE_CREATE", policy => policy.RequireClaim("SUB_MODULE", "CREATE"))
            .AddPolicy("SUB_MODULE_UPDATE", policy => policy.RequireClaim("SUB_MODULE", "UPDATE"))
            .AddPolicy("SUB_MODULE_DELETE", policy => policy.RequireClaim("SUB_MODULE", "DELETE"));

        return services;
    }

    public static IServiceCollection CreateUserStatusAuthorization(this IServiceCollection services)
    {
        services
            .AddAuthorizationBuilder()
            .AddPolicy("USER_STATUS_GET_BY_ID", policy => policy.RequireClaim("USER_STATUS", "GET_BY_ID"))
            .AddPolicy("USER_STATUS_LIST", policy => policy.RequireClaim("USER_STATUS", "LIST"))
            .AddPolicy("USER_STATUS_CREATE", policy => policy.RequireClaim("USER_STATUS", "CREATE"))
            .AddPolicy("USER_STATUS_UPDATE", policy => policy.RequireClaim("USER_STATUS", "UPDATE"))
            .AddPolicy("USER_STATUS_DELETE", policy => policy.RequireClaim("USER_STATUS", "DELETE"));

        return services;
    }

    public static void CreateApplicationsAuthorizations(WebApplicationBuilder builder)
    {
        builder.Services.CreateUsersAuthorizations();
        builder.Services.CreateUserRolesAuthorizations();
        builder.Services.CreateUserClaimsAuthorizations();
        builder.Services.CreateRoleAuthorization();
        builder.Services.CreateRoleClaimsAuthorization();
        builder.Services.CreateBusinessAuthorizations();
        builder.Services.CreateBusinessUsersAuthorizations();
        builder.Services.CreateClaimAuthorization();
        builder.Services.CreateModuleAuthorization();
        builder.Services.CreateSubModuleAuthorization();
        builder.Services.CreateUserStatusAuthorization();
    }
}
