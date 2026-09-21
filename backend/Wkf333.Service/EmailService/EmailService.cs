using Morphus.Entities;
using MailKit;
using MailKit.Security;
using MailKit.Net.Smtp;
using MimeKit;

namespace Morphus.Mail;

public class EmailService : IEmailService
{

  private readonly string _senderName;
  private readonly string _senderEmail;
  private readonly IConfiguration _consuguration;
  private readonly MimeMessage _mimeMessage = new();
  private Email _email = new();

  public EmailService(IConfiguration configuration)
  {
    _email.MailSent = false;

    _consuguration = configuration;
    _senderName = _consuguration["SmtpSettings:SenderName"] ?? "kalupaconsultoria@gmail.com";
    _senderEmail = _consuguration["SmtpSettings:SenderEmail"] ?? "kalupaconsultoria@gmail.com";

    MailFrom(_senderName, _senderEmail);
  }

  public EmailService NewEmail()
  {
    _email = new Email();

    return this;
  }

  public EmailService MailTo(string? email, string? name = null)
  {
    if (String.IsNullOrEmpty(email))
      throw new Exception("Nenhuma e-mail informaod");

    if (String.IsNullOrEmpty(name))
    {
      _email.AddMailTo(email);
      _mimeMessage.To.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailTo(email, name);
      _mimeMessage.To.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailService MailFrom(string? email, string? name = null)
  {
    if (String.IsNullOrEmpty(email))
      throw new Exception("Nenhuma e-mail informaod");

    if (String.IsNullOrEmpty(name))
    {
      _email.AddMailFrom(email);
      _mimeMessage.From.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailFrom(email, name);
      _mimeMessage.From.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailService MailCc(string? email, string? name = null)
  {
    if (String.IsNullOrEmpty(email))
      throw new Exception("Nenhuma e-mail informaod");

    if (String.IsNullOrEmpty(name))
    {
      _email.AddMailCc(email);
      _mimeMessage.Cc.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailCc(email, name);
      _mimeMessage.Cc.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailService MailBcc(string? email, string? name = null)
  {
    if (String.IsNullOrEmpty(email))
      throw new Exception("Nenhuma e-mail informaod");

    if (String.IsNullOrEmpty(name))
    {
      _email.AddMailBcc(email);
      _mimeMessage.Bcc.Add(MailboxAddress.Parse(email));
    }
    else
    {
      _email.AddMailBcc(email, name);
      _mimeMessage.Bcc.Add(new MailboxAddress(name, email));
    }

    return this;
  }

  public EmailService Subject(string? subject)
  {
    _email.Subject = subject ?? "Mensagem Sem Assunto";
    _mimeMessage.Subject = subject ?? "Mensagem Sem Assunto";

    return this;
  }

  public EmailService SetTextBody(string? body)
  {
    var bodyBuilder = new BodyBuilder
    {
      TextBody = body
    };

    _email.TextBody = body;
    _email.IsHtmlBody = false;
    _mimeMessage.Body = bodyBuilder.ToMessageBody();

    return this;
  }

  public EmailService SetHtmlBody(string? body)
  {
    var bodyBuilder = new BodyBuilder
    {
      HtmlBody = body
    };

    _email.HtmlBody = body;
    _email.IsHtmlBody = true;
    _mimeMessage.Body = bodyBuilder.ToMessageBody();

    return this;
  }

  public async Task SendEmailAsync()
  {
    using var smtp = new SmtpClient
    {
      CheckCertificateRevocation = false
    };

    var server = _consuguration["SmtpSettings:Server"];
    var port = int.Parse(_consuguration["SmtpSettings:Port"]!);
    var password = _consuguration["SmtpSettings:Password"];

    await smtp.ConnectAsync(server!, port, SecureSocketOptions.StartTls);
    await smtp.AuthenticateAsync(_senderEmail, password!);
    await smtp.SendAsync(_mimeMessage);
    await smtp.DisconnectAsync(true);
  }
}
