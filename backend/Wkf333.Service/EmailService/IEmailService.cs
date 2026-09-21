namespace Morphus.Mail;

public interface IEmailService
{
  EmailService MailTo(string? email, string? name = null);
  EmailService MailFrom(string? email, string? name = null);
  EmailService MailCc(string? email, string? name = null);
  EmailService MailBcc(string? email, string? name = null);
  EmailService SetTextBody(string? body);
  EmailService SetHtmlBody(string? body);
  EmailService Subject(string? subject);
  Task SendEmailAsync();
}
