using Morphus.Application.MorphusService;
using Morphus.Domain.Entities.Models;

namespace Morphus.Application.Services.MailSerrvice;

public interface IEmailService : IMorphusService<Email>
{
  EmailService MailTo(string? email, string? name = null);
  EmailService MailFrom(string? email, string? name = null);
  EmailService MailCc(string? email, string? name = null);
  EmailService MailBcc(string? email, string? name = null);
  EmailService SetTextBody(string body);
  EmailService SetHtmlBody(string body);
  EmailService Subject(string subject);
  EmailService ReplaceHtmlFile(string oldValue, string? newValue);
  EmailService ReplaceTextFile(string oldValue, string? newValue);
  EmailService LoadEmail(Email email);
  EmailService LoadTextFilte(string path);
  EmailService LoadHtmlFilte(string path);
  Task<Email> SendEmailAsync();
  Task<Email> Create(Email entity);
}
