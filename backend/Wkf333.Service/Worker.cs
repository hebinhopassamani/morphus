using Microsoft.EntityFrameworkCore;
using Morphus.Entities;
using Morphus.Mail;

namespace MyBackgroundWorker;

public class Worker : BackgroundService
{
  private readonly ILogger<Worker> _logger;
  private readonly IServiceScopeFactory _scopeFactory;
  private readonly IEmailService _emailService;

  public Worker(ILogger<Worker> logger, IServiceScopeFactory scopeFactory, IEmailService emailService)
  {
    _logger = logger;
    _scopeFactory = scopeFactory;
    _emailService = emailService;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    while (!stoppingToken.IsCancellationRequested)
    {

      try
      {
        _logger.LogInformation("Processamento iniciado às: {time}", DateTimeOffset.Now);

        using IServiceScope scope = _scopeFactory.CreateScope();
        MorphusContext dbContext = scope.ServiceProvider.GetRequiredService<MorphusContext>();

        var emails = await dbContext.Email
                           .Include(e => e.EmaislTo)
                           .Include(e => e.EmailsFrom)
                           .Include(e => e.EmailsCc)
                           .Include(e => e.EmailsBcc)
                           .Where(u => !u.MailSent)
                           .ToListAsync(stoppingToken);

        _logger.LogInformation("Emails encontrados {Email}", emails.Count);

        foreach (var email in emails)
        {
          _logger.LogInformation("Inicio do envio de email");

          foreach (var mailTo in email.EmaislTo)
          {
            _emailService.MailTo(mailTo.Mail, mailTo.Name);
          }

          foreach (var mailFrom in email.EmailsFrom)
          {
            _emailService.MailFrom(mailFrom.Mail, mailFrom.Name);
          }

          foreach (var mailCc in email.EmailsCc)
          {
            _emailService.MailCc(mailCc.Mail, mailCc.Name);
          }

          foreach (var mailBcc in email.EmailsBcc)
          {
            _emailService.MailBcc(mailBcc.Mail, mailBcc.Name);
          }

          if (email.IsHtmlBody)
            _emailService.SetHtmlBody(email.HtmlBody);
          else
            _emailService.SetTextBody(email.TextBody);

          _emailService.Subject(email.Subject);

          email.MailSent = false;

          await dbContext.SaveChangesAsync(stoppingToken);

          await _emailService.SendEmailAsync();

          email.MailSent = true;

          await dbContext.SaveChangesAsync(stoppingToken);

          _logger.LogInformation("Envio Finalizado");
        }
      }
      catch (Exception ex)
      {
        _logger.LogInformation("Ocorreu um erro no envio");
        _logger.LogInformation(ex.ToString());
      }

      await Task.Delay(10000, stoppingToken);
    }
  }
}
