using Microsoft.EntityFrameworkCore;
using Mpx.Infrastructure.Data.Core;
using Mpx.Jarbass.Workers.Base;

namespace Mpx.Jarbass.Workers;

public sealed class JarbassMaintenanceWorker(
    ILogger<JarbassMaintenanceWorker> logger,
    IServiceProvider serviceProvider,
    IConfiguration configuration)
    : MpxJarbassWorker(logger, serviceProvider, configuration, "Maintenance", defaultIntervalSeconds: 300)
{
  protected override async Task ExecuteCycleAsync(IServiceProvider scopedProvider, CancellationToken stoppingToken)
  {
    var dbContext = scopedProvider.GetRequiredService<MpxDbContext>();
    var canConnect = await dbContext.Database.CanConnectAsync(stoppingToken);

    Logger.LogDebug("[Jarbass:Maintenance] Health check do banco de dados concluído (CanConnect = {CanConnect}).", canConnect);
  }
}
