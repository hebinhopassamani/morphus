using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Mpx.Infrastructure.Interfaces;
using Npgsql;

namespace Mpx.Infrastructure.Data;

/// <summary>
/// Fábrica utilizada pelo Entity Framework Core em tempo de design (Terminal/Migrations).
/// Impede o erro de falta de serviços HTTP ao rodar comandos de banco de dados.
/// </summary>
public class MorphusDbContextFactory : IDesignTimeDbContextFactory<MorphusDbContext>
{
  public MorphusDbContext CreateDbContext(string[] args)
  {
    var optionsBuilder = new DbContextOptionsBuilder<MorphusDbContext>();

    // 1. Resgata a senha do 1Password direto da memória do terminal
    var password = Environment.GetEnvironmentVariable("POSTGRES_DB_PASSWORD");

    // 2. Monte a mesma string de conexão que aponta para o Postgres da sua VPS
    // (Altere o IP e as portas para bater com o seu ambiente real da VPS)
    var connectionString = "Server=179.197.232.25;Port=5433;Database=morphus;User Id=morphus;";

    var connectionBuilder = new NpgsqlConnectionStringBuilder(connectionString)
    {
      Password = password ?? throw new InvalidOperationException("Nenhuma senha de banco de dados configurada na memória.")
    };

    // 3. Aplica as mesmas convenções idênticas ao seu Program.cs
    optionsBuilder
        .UseLazyLoadingProxies()
        .UseSnakeCaseNamingConvention()
        .UseNpgsql(connectionBuilder.ConnectionString, b => b.MigrationsAssembly(typeof(MorphusDbContext).Assembly.FullName));

    // 4. Criamos um "FakeTenantProvider" apenas para o terminal não estourar erro de nulo
    var fakeTenantProvider = new FakeDesignTimeTenantProvider();

    return new MorphusDbContext(optionsBuilder.Options, fakeTenantProvider);
  }
}

/// <summary>
/// Provedor fantasma usado apenas para as ferramentas de linha de comando (Migrations) não quebrarem
/// </summary>
public class FakeDesignTimeTenantProvider : ITenantProvider
{
  public Guid GetCorporationId() => Guid.Empty;
}
