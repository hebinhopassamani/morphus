using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

using Mpx.Infrastructure.MultiTenant;

using Npgsql;

namespace Mpx.Infrastructure.Data.Core;

public class MpxDbContextFactory : IDesignTimeDbContextFactory<MpxDbContext>
{
  public MpxDbContext CreateDbContext(string[] args)
  {
    var optionsBuilder = new DbContextOptionsBuilder<MpxDbContext>();

    var password = Environment.GetEnvironmentVariable("POSTGRES_DB_PASSWORD");
    var connectionString = "Server=179.197.232.25;Port=5433;Database=morphus;User Id=morphus;";

    var connectionBuilder = new NpgsqlConnectionStringBuilder(connectionString)
    {
      Password = password ?? throw new InvalidOperationException("Nenhuma senha de banco de dados configurada na memória.")
    };

    optionsBuilder
        .UseLazyLoadingProxies()
        .UseSnakeCaseNamingConvention()
        .UseNpgsql(connectionBuilder.ConnectionString, b => b.MigrationsAssembly(typeof(MpxDbContext).Assembly.FullName));

    var fakeTenantProvider = new DesignTimeTenantProvider();

    return new MpxDbContext(optionsBuilder.Options, fakeTenantProvider);
  }
}
