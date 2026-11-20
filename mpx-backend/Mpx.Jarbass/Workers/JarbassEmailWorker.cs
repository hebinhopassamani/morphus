using Microsoft.EntityFrameworkCore;
using Mpx.Infrastructure.Data.Core;
using Mpx.Jarbass.Workers.Base;

namespace Mpx.Jarbass.Workers;

public sealed class JarbassEmailWorker(
    ILogger<JarbassEmailWorker> logger,
    IServiceProvider serviceProvider,
    IConfiguration configuration)
    : MpxJarbassWorker(logger, serviceProvider, configuration, "Email", defaultIntervalSeconds: 10)
{
  protected override async Task ExecuteCycleAsync(IServiceProvider scopedProvider, CancellationToken stoppingToken)
  {
    var dbContext = scopedProvider.GetRequiredService<MpxDbContext>();

    var pendingCount = await dbContext.Emails
        .AsNoTracking()
        .CountAsync(e => !e.Inactive && !e.MailSent, stoppingToken);

    if (pendingCount > 0)
    {
      Logger.LogInformation("[Jarbass:Email] {PendingCount} e-mail(s) aguardando processamento na fila.", pendingCount);
    }
  }
}
