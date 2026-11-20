using Mpx.CrossCutting;
using Mpx.Jarbass.Workers.Base;

namespace Mpx.Jarbass.Workers;

public sealed class JarbassCatalogWorker(
    ILogger<JarbassCatalogWorker> logger,
    IServiceProvider serviceProvider,
    IConfiguration configuration)
    : MpxJarbassWorker(logger, serviceProvider, configuration, "Catalog", defaultIntervalSeconds: 60)
{
  protected override Task ExecuteCycleAsync(IServiceProvider scopedProvider, CancellationToken stoppingToken)
  {
    scopedProvider.SyncMorphusEntityCatalog();
    Logger.LogDebug("[Jarbass:Catalog] Catálogo .Reflected (mpx_entities / mpx_entity_properties) sincronizado.");
    return Task.CompletedTask;
  }
}
